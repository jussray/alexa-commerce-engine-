const test = require('node:test');
const assert = require('node:assert/strict');
const { productEntity, addToCartDirective } = require('../src/shopping-actions');

const product = { asin:'B0C33CHG99' };

test('Associates attribution is absent by default', () => {
  delete process.env.ASSOCIATES_ENABLED;
  delete process.env.AMAZON_ASSOCIATES_ID;
  const entity = productEntity(product);
  assert.deepEqual(entity, { asin:'B0C33CHG99' });
});

test('Associates attribution is included only when explicitly enabled', () => {
  process.env.ASSOCIATES_ENABLED = 'true';
  process.env.AMAZON_ASSOCIATES_ID = 'example-20';
  process.env.AMAZON_TRACKING_ID = 'airfryer-segment';
  const entity = productEntity(product);
  assert.equal(entity.attribution.associateId, 'example-20');
  assert.equal(entity.attribution.trackingId, 'airfryer-segment');
});

test('add-to-cart directive uses Amazon shopping task and one product', () => {
  delete process.env.ASSOCIATES_ENABLED;
  const directive = addToCartDirective(product, 'test-token');
  assert.equal(directive.uri, 'connection://AMAZON.AddToShoppingCart/1');
  assert.equal(directive.input.products.length, 1);
  assert.equal(directive.token, 'test-token');
});
