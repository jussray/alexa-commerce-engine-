function productEntity(product) {
  const entity = { asin: product.asin };
  const associatesEnabled = process.env.ASSOCIATES_ENABLED === 'true';
  const associateId = process.env.AMAZON_ASSOCIATES_ID || '';
  const trackingId = process.env.AMAZON_TRACKING_ID || '';

  if (associatesEnabled && associateId) {
    entity.attribution = { associateId };
    if (trackingId) entity.attribution.trackingId = trackingId;
  }

  return entity;
}

function addToCartDirective(product, token) {
  return {
    type: 'Connections.StartConnection',
    uri: 'connection://AMAZON.AddToShoppingCart/1',
    input: { products: [productEntity(product)] },
    token,
  };
}

module.exports = { productEntity, addToCartDirective };
