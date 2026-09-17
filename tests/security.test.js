const test = require('node:test');
const assert = require('node:assert/strict');
const { redactString, safeError } = require('../src/security');

test('redactString removes secret-shaped environment values and bounds output', () => {
  const env = {
    SOME_API_KEY: 'super-secret-key',
    AMAZON_TRACKING_ID: 'tracking-sensitive',
  };
  const output = redactString(`failure super-secret-key ${'x'.repeat(400)} tracking-sensitive`, env);
  assert.equal(output.includes('super-secret-key'), false);
  assert.equal(output.includes('tracking-sensitive'), false);
  assert.ok(output.length <= 241);
});

test('safeError never serializes stack or arbitrary error fields', () => {
  const error = new Error('request failed for super-secret-key');
  error.stack = 'stack with super-secret-key';
  error.request = { headers:{ authorization:'super-secret-key' } };
  const safe = safeError(error, { SERVICE_TOKEN:'super-secret-key' });
  assert.deepEqual(Object.keys(safe).sort(), ['message', 'name']);
  assert.equal(JSON.stringify(safe).includes('super-secret-key'), false);
  assert.equal(JSON.stringify(safe).includes('authorization'), false);
});
