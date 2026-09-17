const test = require('node:test');
const assert = require('node:assert/strict');
const catalog = require('../src/catalog');
const { resolveCategory, recommend, listCategories } = require('../src/recommendation-engine');

test('all six seed categories are present', () => {
  assert.equal(listCategories().length, 6);
});

test('category aliases resolve', () => {
  assert.equal(resolveCategory('earbuds'), 'wireless-earbuds');
  assert.equal(resolveCategory('air fryer'), 'air-fryers');
  assert.equal(resolveCategory('robot vacuum'), 'robot-vacuums');
});

test('every catalog item has a syntactically valid ASIN', () => {
  for (const category of Object.values(catalog)) {
    for (const product of category.products) {
      assert.match(product.asin, /^[A-Z0-9]{10}$/);
    }
  }
});

test('air fryer dual basket selects Ninja', () => {
  const result = recommend({ category:'air fryer', budget:'premium', priority:'two foods', household:'large household' });
  assert.equal(result.product.key, 'ninja-dualzone');
  assert.equal(result.criteria.unmatched.length, 0);
});

test('robot vacuum pet hair premium selects Roborock', () => {
  const result = recommend({ category:'robot vacuum', budget:'premium', priority:'pet hair', household:'pets' });
  assert.equal(result.product.key, 'roborock-q7-m5-plus');
});

test('LED smart home premium selects Govee', () => {
  const result = recommend({ category:'led lights', budget:'premium', priority:'smart home' });
  assert.equal(result.product.key, 'govee-rgbic-100ft');
});

test('reason does not claim an unavailable budget match', () => {
  const result = recommend({ category:'tumblers', budget:'budget', priority:'travel' });
  assert.equal(result.product.priceTier, 'mid');
  assert.equal(result.reason.includes('matches your budget preference'), false);
  assert.match(result.reason, /closest available/);
  assert.ok(result.criteria.unmatched.some((item) => item.kind === 'budget'));
});

test('unknown category fails closed', () => {
  assert.equal(recommend({ category:'toaster ovens' }).error, 'UNKNOWN_CATEGORY');
});
