function associatesConfig(env = process.env) {
  const enabled = env.ASSOCIATES_ENABLED === 'true';
  const associateId = String(env.AMAZON_ASSOCIATES_ID || '').trim();
  const trackingId = String(env.AMAZON_TRACKING_ID || '').trim();

  if (enabled && !associateId) {
    const error = new Error('Associates attribution is enabled but required configuration is missing.');
    error.code = 'ASSOCIATES_CONFIG_INVALID';
    throw error;
  }

  return { enabled, associateId, trackingId };
}

function validateAsin(asin) {
  return /^[A-Z0-9]{10}$/.test(String(asin || '').trim());
}

function productEntity(product, env = process.env) {
  const asin = String(product?.asin || '').trim().toUpperCase();
  if (!validateAsin(asin)) {
    const error = new Error('Product ASIN is invalid.');
    error.code = 'INVALID_ASIN';
    throw error;
  }

  const entity = { asin };
  const config = associatesConfig(env);

  if (config.enabled) {
    entity.attribution = { associateId: config.associateId };
    if (config.trackingId) entity.attribution.trackingId = config.trackingId;
  }

  return entity;
}

function validateToken(token) {
  const normalized = String(token || '');
  if (!normalized || normalized.length > 256) {
    const error = new Error('Shopping continuation token is invalid.');
    error.code = 'INVALID_SHOPPING_TOKEN';
    throw error;
  }
  return normalized;
}

function addToCartDirective(product, token, env = process.env) {
  return {
    type: 'Connections.StartConnection',
    uri: 'connection://AMAZON.AddToShoppingCart/1',
    input: { products: [productEntity(product, env)] },
    token: validateToken(token),
  };
}

module.exports = {
  associatesConfig,
  validateAsin,
  productEntity,
  validateToken,
  addToCartDirective,
};
