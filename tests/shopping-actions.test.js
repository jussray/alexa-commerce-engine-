const test = require('node:test');
const assert = require('node:assert/strict');
const {
  associatesConfig,
  validateAsin,
  productEntity,
  addToCartDirective,
  interpretShoppingResult,
} = require('../src/shopping-actions');

const product = { asin:'B0C33CHG99' };

test('Associates attribution is absent by default', () => {
  const entity = productEntity(product, {});
  assert.deepEqual(entity, { asin:'B0C33CHG99' });
});

test('Associates attribution is included only when explicitly enabled with required id', () => {
  const env = {
    ASSOCIATES_ENABLED: 'true',
    AMAZON_ASSOCIATES_ID: 'example-20',
    AMAZON_TRACKING_ID: 'airfryer-segment',
  };
  const entity = productEntity(product, env);
  assert.equal(entity.attribution.associateId, 'example-20');
  assert.equal(entity.attribution.trackingId, 'airfryer-segment');
});

test('Associates enabled without id fails closed without echoing a secret', () => {
  assert.throws(
    () => associatesConfig({ ASSOCIATES_ENABLED:'true', AMAZON_ASSOCIATES_ID:'' }),
    (error) => error.code === 'ASSOCIATES_CONFIG_INVALID' && !error.message.includes('example-20')
  );
});

test('invalid ASIN fails before a shopping directive can be emitted', () => {
  assert.equal(validateAsin('BAD'), false);
  assert.throws(() => productEntity({ asin:'BAD' }, {}), (error) => error.code === 'INVALID_ASIN');
});

test('add-to-cart directive uses Amazon shopping task and exactly one product', () => {
  const directive = addToCartDirective(product, 'test-token', {});
  assert.equal(directive.uri, 'connection://AMAZON.AddToShoppingCart/1');
  assert.equal(directive.input.products.length, 1);
  assert.equal(directive.token, 'test-token');
});

test('successful provider receipt requires the exact continuation token and no result error', () => {
  const verdict = interpretShoppingResult({
    token:'test-token',
    status:{ code:'200', message:'OK' },
  }, 'test-token');
  assert.equal(verdict.status, 'success');
});

test('200 plus task result error is not treated as success', () => {
  const verdict = interpretShoppingResult({
    token:'test-token',
    status:{ code:'200', message:'OK' },
    result:{ code:'AlexaShopping.RetryLaterError', message:'try later' },
  }, 'test-token');
  assert.equal(verdict.status, 'provider_error');
});

test('AssociatesInvalidInputError keeps shopping outcome separate from attribution truth', () => {
  const verdict = interpretShoppingResult({
    token:'test-token',
    status:{ code:'200', message:'OK' },
    result:{ code:'AlexaShopping.AssociatesInvalidInputError', message:'bad attribution' },
  }, 'test-token');
  assert.equal(verdict.status, 'attribution_error');
});

test('mismatched continuation token invalidates stale proof', () => {
  const verdict = interpretShoppingResult({
    token:'other-token',
    status:{ code:'200', message:'OK' },
  }, 'test-token');
  assert.equal(verdict.status, 'continuity_mismatch');
});
