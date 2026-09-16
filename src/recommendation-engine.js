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

function scoreProduct(product, { budget = '', priority = '', household = '' } = {}) {
  let score = 0;
  const budgetNorm = normalize(budget);
  const priorityNorm = normalize(priority);
  const householdNorm = normalize(household);

  if (budgetNorm) {
    if (budgetNorm.includes('budget') || budgetNorm.includes('cheap') || budgetNorm.includes('low')) {
      if (product.priceTier === 'budget') score += 5;
      if (product.priceTier === 'mid') score += 2;
    } else if (budgetNorm.includes('premium') || budgetNorm.includes('best')) {
      if (product.priceTier === 'premium') score += 5;
      if (product.priceTier === 'mid') score += 2;
    } else if (budgetNorm.includes('mid') || budgetNorm.includes('middle') || budgetNorm.includes('value')) {
      if (product.priceTier === 'mid') score += 5;
      if (product.priceTier === 'budget') score += 2;
    }
  }

  for (const trait of product.traits || []) {
    const spaced = trait.replace(/-/g, ' ');
    if (priorityNorm && (priorityNorm.includes(spaced) || spaced.includes(priorityNorm))) score += 4;
    if (householdNorm && (householdNorm.includes(spaced) || spaced.includes(householdNorm))) score += 3;
  }

  return score;
}

function buildReason(product, { budget, priority, household } = {}) {
  const reasons = [];
  if (budget) reasons.push(`it fits the ${normalize(budget)} preference`);
  if (priority) reasons.push(`it best matches ${normalize(priority)}`);
  if (household) reasons.push(`it aligns with ${normalize(household)}`);
  if (!reasons.length) reasons.push(`it is a strong ${product.priceTier} option in this category`);
  return reasons.join(', ');
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
  return {
    categoryKey,
    categoryName: categoryData.displayName,
    product: winner,
    alternatives: ranked.slice(1, 3),
    reason: buildReason(winner, { budget, priority, household }),
  };
}

function listCategories() {
  return Object.entries(catalog).map(([key, value]) => ({ key, displayName: value.displayName }));
}

module.exports = { resolveCategory, scoreProduct, recommend, listCategories };
