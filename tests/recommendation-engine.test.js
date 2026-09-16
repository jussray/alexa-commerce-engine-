const test = require('node:test');
const assert = require('node:assert/strict');
const { resolveCategory, recommend, listCategories } = require('../src/recommendation-engine');

test('all six seed categories are present', () => {
  assert.equal(listCategories().length, 6);
});

test('category aliases resolve', () => {
  assert.equal(resolveCategory('earbuds'), 'wireless-earbuds');
  assert.equal(resolveCategory('air fryer'), 'air-fryers');
  assert.equal(resolveCategory('robot vacuum'), 'robot-vacuums');
});

test('air fryer dual basket selects Ninja', () => {
  const result = recommend({ category:'air fryer', budget:'premium', priority:'two foods', household:'large household' });
  assert.equal(result.product.key, 'ninja-dualzone');
});

test('robot vacuum pet hair premium selects Roborock', () => {
  const result = recommend({ category:'robot vacuum', budget:'premium', priority:'pet hair', household:'pets' });
  assert.equal(result.product.key, 'roborock-q7-m5-plus');
});

test('LED smart home premium selects Govee', () => {
  const result = recommend({ category:'led lights', budget:'premium', priority:'smart home' });
  assert.equal(result.product.key, 'govee-rgbic-100ft');
});

test('unknown category fails closed', () => {
  assert.equal(recommend({ category:'toaster ovens' }).error, 'UNKNOWN_CATEGORY');
});
