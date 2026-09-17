const catalog = require('./catalog');

const CATEGORY_ALIASES = {
  earbuds: 'wireless-earbuds',
  'wireless earbuds': 'wireless-earbuds',
  headphones: 'wireless-earbuds',
  'air fryer': 'air-fryers',
  'air fryers': 'air-fryers',
  'robot vacuum': 'robot-vacuums',
  'robot vacuums': 'robot-vacuums',
  'resistance bands': 'resistance-bands',
  'exercise bands': 'resistance-bands',
  'led lights': 'led-strip-lights',
  'led strip lights': 'led-strip-lights',
  'strip lights': 'led-strip-lights',
  tumbler: 'tumblers-bottles',
  tumblers: 'tumblers-bottles',
  'water bottle': 'tumblers-bottles',
  'water bottles': 'tumblers-bottles',
};

function normalize(value = '') {
  return String(value).trim().toLowerCase();
}

function resolveCategory(value = '') {
  const normalized = normalize(value);
  if (catalog[normalized]) return normalized;
  return CATEGORY_ALIASES[normalized] || null;
}

function requestedBudgetTier(budget = '') {
  const value = normalize(budget);
  if (!value) return null;
  if (value.includes('budget') || value.includes('cheap') || value.includes('low')) return 'budget';
  if (value.includes('premium') || value.includes('best') || value.includes('high end')) return 'premium';
  if (value.includes('mid') || value.includes('middle') || value.includes('value')) return 'mid';
  return null;
}

function traitMatches(traits = [], requested = '') {
  const request = normalize(requested);
  if (!request) return false;
  return traits.some((trait) => {
    const spaced = normalize(trait).replace(/-/g, ' ');
    return request.includes(spaced) || spaced.includes(request);
  });
}

function scoreProduct(product, { budget = '', priority = '', household = '' } = {}) {
  let score = 0;
  const budgetTier = requestedBudgetTier(budget);

  if (budgetTier) {
    if (product.priceTier === budgetTier) score += 5;
    if (budgetTier === 'budget' && product.priceTier === 'mid') score += 2;
    if (budgetTier === 'premium' && product.priceTier === 'mid') score += 2;
    if (budgetTier === 'mid' && product.priceTier === 'budget') score += 2;
  }

  if (traitMatches(product.traits, priority)) score += 4;
  if (traitMatches(product.traits, household)) score += 3;

  return score;
}

function evaluateCriteria(product, { budget = '', priority = '', household = '' } = {}) {
  const requested = [];
  const matched = [];
  const unmatched = [];
  const budgetTier = requestedBudgetTier(budget);

  if (budget) {
    const item = { kind: 'budget', requested: normalize(budget), matched: Boolean(budgetTier && product.priceTier === budgetTier) };
    requested.push(item);
    (item.matched ? matched : unmatched).push(item);
  }

  if (priority) {
    const item = { kind: 'priority', requested: normalize(priority), matched: traitMatches(product.traits, priority) };
    requested.push(item);
    (item.matched ? matched : unmatched).push(item);
  }

  if (household) {
    const item = { kind: 'household', requested: normalize(household), matched: traitMatches(product.traits, household) };
    requested.push(item);
    (item.matched ? matched : unmatched).push(item);
  }

  return { requested, matched, unmatched };
}

function buildReason(product, criteria) {
  const { matched, unmatched } = evaluateCriteria(product, criteria);
  const reasons = matched.map((item) => {
    if (item.kind === 'budget') return `it matches your ${item.requested} preference`;
    if (item.kind === 'priority') return `it matches ${item.requested}`;
    return `it matches ${item.requested}`;
  });

  if (reasons.length && !unmatched.length) return reasons.join(', ');
  if (reasons.length && unmatched.length) {
    return `${reasons.join(', ')}, and it is the closest available catalog option for the remaining preferences`;
  }
  if (unmatched.length) {
    return `it is the closest available ${product.priceTier} catalog option, but it does not exactly match every requested preference`;
  }
  return `it is a strong ${product.priceTier} option in this category`;
}

function recommend({ category, budget, priority, household } = {}) {
  const categoryKey = resolveCategory(category);
  if (!categoryKey) return { error: 'UNKNOWN_CATEGORY' };

  const categoryData = catalog[categoryKey];
  const ranked = categoryData.products
    .map(product => ({
      ...product,
      score: scoreProduct(product, { budget, priority, household }),
    }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  const winner = ranked[0];
  const criteria = { budget, priority, household };
  return {
    categoryKey,
    categoryName: categoryData.displayName,
    product: winner,
    alternatives: ranked.slice(1, 3),
    reason: buildReason(winner, criteria),
    criteria: evaluateCriteria(winner, criteria),
  };
}

function listCategories() {
  return Object.entries(catalog).map(([key, value]) => ({ key, displayName: value.displayName }));
}

module.exports = {
  resolveCategory,
  requestedBudgetTier,
  traitMatches,
  scoreProduct,
  evaluateCriteria,
  buildReason,
  recommend,
  listCategories,
};
