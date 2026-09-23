const test = require('node:test');
const assert = require('node:assert/strict');
const { createHttpServer, MCP_MIN_VERSION } = require('../src/mcp-server');

async function withServer(run) {
  const server = createHttpServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;
  try {
    await run(baseUrl);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

function parsePayload(text, contentType = '') {
  if (contentType.includes('text/event-stream')) {
    const dataLine = text.split('\n').find(line => line.startsWith('data:'));
    assert.ok(dataLine, 'expected an SSE data line');
    return JSON.parse(dataLine.slice(5).trim());
  }
  return JSON.parse(text);
}

async function rpc(baseUrl, body, headers = {}) {
  const response = await fetch(`${baseUrl}/mcp`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'accept': 'application/json, text/event-stream',
      'mcp-protocol-version': MCP_MIN_VERSION,
      ...headers,
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  return {
    response,
    payload: parsePayload(text, response.headers.get('content-type') || ''),
  };
}

test('health advertises the required Alexa+ MCP minimum', async () => {
  await withServer(async baseUrl => {
    const response = await fetch(`${baseUrl}/health`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.ok, true);
    assert.equal(body.mcpMinimum, '2025-11-25');
    assert.equal(body.mcpEndpoint, '/mcp');
  });
});

test('MCP initialize negotiates the 2025-11-25 protocol', async () => {
  await withServer(async baseUrl => {
    const { response, payload } = await rpc(baseUrl, {
      jsonrpc: '2.0',
      id: 'init-1',
      method: 'initialize',
      params: {
        protocolVersion: '2025-11-25',
        capabilities: {},
        clientInfo: { name: 'hackathon-test', version: '1.0.0' },
      },
    });
    assert.equal(response.status, 200);
    assert.equal(payload.result.protocolVersion, '2025-11-25');
    assert.equal(payload.result.serverInfo.name, 'shopping-compass');
  });
});

test('MCP exposes commerce tools and returns a truthful recommendation', async () => {
  await withServer(async baseUrl => {
    const listed = await rpc(baseUrl, {
      jsonrpc: '2.0',
      id: 'tools-1',
      method: 'tools/list',
      params: {},
    });
    assert.equal(listed.response.status, 200);
    const names = listed.payload.result.tools.map(tool => tool.name);
    assert.deepEqual(names.sort(), [
      'list_categories',
      'prepare_amazon_cart_handoff',
      'recommend_product',
    ]);

    const called = await rpc(baseUrl, {
      jsonrpc: '2.0',
      id: 'call-1',
      method: 'tools/call',
      params: {
        name: 'recommend_product',
        arguments: {
          category: 'wireless earbuds',
          budget: 'budget',
          priority: 'battery',
          household: 'family',
        },
      },
    });
    assert.equal(called.response.status, 200);
    assert.equal(called.payload.result.isError, undefined);
    assert.equal(called.payload.result.structuredContent.ok, true);
    assert.equal(called.payload.result.structuredContent.proof.purchaseClaimed, false);
    assert.equal(called.payload.result.structuredContent.proof.commissionClaimed, false);
  });
});

test('cart handoff requires explicit confirmation and never claims purchase', async () => {
  await withServer(async baseUrl => {
    const unconfirmed = await rpc(baseUrl, {
      jsonrpc: '2.0',
      id: 'call-2',
      method: 'tools/call',
      params: {
        name: 'prepare_amazon_cart_handoff',
        arguments: { category: 'air fryers', budget: 'mid', confirmed: false },
      },
    });
    assert.equal(unconfirmed.payload.result.structuredContent.status, 'confirmation_required');

    const confirmed = await rpc(baseUrl, {
      jsonrpc: '2.0',
      id: 'call-3',
      method: 'tools/call',
      params: {
        name: 'prepare_amazon_cart_handoff',
        arguments: { category: 'air fryers', budget: 'mid', confirmed: true },
      },
    });
    const body = confirmed.payload.result.structuredContent;
    assert.equal(body.status, 'handoff_prepared');
    assert.equal(body.action, 'AMAZON.AddToShoppingCart');
    assert.equal(body.authority.shopperConfirmed, true);
    assert.equal(body.authority.executedByThisMcpServer, false);
    assert.equal(body.proof.purchaseClaimed, false);
    assert.equal(body.proof.commissionClaimed, false);
  });
});
