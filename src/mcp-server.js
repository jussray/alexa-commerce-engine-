const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { createMcpHandler, McpServer } = require('@modelcontextprotocol/server');
const { toNodeHandler } = require('@modelcontextprotocol/node');
const { z } = require('zod/v4');
const { recommend, listCategories } = require('./recommendation-engine');
const { productEntity } = require('./shopping-actions');

const MCP_MIN_VERSION = '2025-11-25';
const SERVER_VERSION = '0.2.0';

function toolResult(data) {
  return {
    content: [{ type: 'text', text: JSON.stringify(data) }],
    structuredContent: data,
  };
}

function createCommerceMcpServer({ era = 'legacy' } = {}) {
  const server = new McpServer({
    name: 'shopping-compass',
    version: SERVER_VERSION,
  });

  server.registerTool(
    'list_categories',
    {
      title: 'List shopping categories',
      description: 'List the product categories supported by Shopping Compass.',
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async () => toolResult({
      categories: listCategories(),
      protocolMinimum: MCP_MIN_VERSION,
      era,
    }),
  );

  server.registerTool(
    'recommend_product',
    {
      title: 'Recommend a product',
      description: 'Rank catalog products from a shopper category, budget, priority, and household context while exposing matched and unmatched criteria.',
      inputSchema: z.object({
        category: z.string().min(1),
        budget: z.string().optional().default(''),
        priority: z.string().optional().default(''),
        household: z.string().optional().default(''),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async (input) => {
      const result = recommend(input);
      if (result.error) {
        return {
          content: [{ type: 'text', text: `Unsupported category: ${input.category}` }],
          structuredContent: { ok: false, error: result.error, category: input.category },
          isError: true,
        };
      }

      return toolResult({
        ok: true,
        recommendation: result,
        proof: {
          source: 'local-catalog',
          matchedCriteria: result.criteria.matched.length,
          unmatchedCriteria: result.criteria.unmatched.length,
          purchaseClaimed: false,
          commissionClaimed: false,
        },
      });
    },
  );

  server.registerTool(
    'prepare_amazon_cart_handoff',
    {
      title: 'Prepare Amazon cart handoff',
      description: 'Prepare, but do not execute, an Amazon shopping handoff for a recommended product. The tool requires explicit shopper confirmation and never reports a purchase or commission as complete.',
      inputSchema: z.object({
        category: z.string().min(1),
        budget: z.string().optional().default(''),
        priority: z.string().optional().default(''),
        household: z.string().optional().default(''),
        confirmed: z.boolean(),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async (input) => {
      if (!input.confirmed) {
        return toolResult({
          ok: false,
          status: 'confirmation_required',
          message: 'Explicit shopper confirmation is required before preparing a cart handoff.',
        });
      }

      const result = recommend(input);
      if (result.error) {
        return {
          content: [{ type: 'text', text: `Unsupported category: ${input.category}` }],
          structuredContent: { ok: false, error: result.error, category: input.category },
          isError: true,
        };
      }

      const entity = productEntity(result.product, { ASSOCIATES_ENABLED: 'false' });
      return toolResult({
        ok: true,
        status: 'handoff_prepared',
        action: 'AMAZON.AddToShoppingCart',
        product: {
          name: result.product.name,
          asin: entity.asin,
        },
        authority: {
          shopperConfirmed: true,
          executedByThisMcpServer: false,
          amazonControlsFinalOfferAndCart: true,
        },
        proof: {
          purchaseClaimed: false,
          commissionClaimed: false,
          nextBoundary: 'Amazon-controlled shopping surface',
        },
      });
    },
  );

  return server;
}

const mcpHandler = createMcpHandler(
  ({ era }) => createCommerceMcpServer({ era }),
  {
    legacy: 'stateless',
    responseMode: 'json',
    onerror: error => console.error(JSON.stringify({ event: 'mcp_error', message: error.message })),
  },
);

const nodeMcpHandler = toNodeHandler(mcpHandler);

function serveJson(res, statusCode, body) {
  res.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  res.end(JSON.stringify(body));
}

function createHttpServer() {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`);

      if (url.pathname === '/mcp') {
        return nodeMcpHandler(req, res);
      }

      if (url.pathname === '/health') {
        return serveJson(res, 200, {
          ok: true,
          service: 'shopping-compass',
          mcpEndpoint: '/mcp',
          mcpMinimum: MCP_MIN_VERSION,
          serverVersion: SERVER_VERSION,
        });
      }

      if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/simulator')) {
        const filePath = path.join(__dirname, '..', 'public', 'index.html');
        const html = fs.readFileSync(filePath, 'utf8');
        res.writeHead(200, {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'no-store',
        });
        return res.end(html);
      }

      return serveJson(res, 404, { ok: false, error: 'NOT_FOUND' });
    } catch (error) {
      console.error(JSON.stringify({ event: 'http_error', message: error.message }));
      if (!res.headersSent) return serveJson(res, 500, { ok: false, error: 'INTERNAL_ERROR' });
      return res.end();
    }
  });
}

if (require.main === module) {
  const host = process.env.HOST || '127.0.0.1';
  const port = Number(process.env.PORT || 3000);
  const server = createHttpServer();
  server.listen(port, host, () => {
    console.log(JSON.stringify({
      event: 'shopping_compass_started',
      host,
      port,
      mcp: `http://${host}:${port}/mcp`,
      simulator: `http://${host}:${port}/`,
      mcpMinimum: MCP_MIN_VERSION,
    }));
  });
}

module.exports = {
  MCP_MIN_VERSION,
  createCommerceMcpServer,
  createHttpServer,
  mcpHandler,
};
