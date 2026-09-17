const crypto = require('node:crypto');

const SOURCES = new Set([
  'skill_runtime',
  'alexa_skill_metrics',
  'amazon_associates',
  'historical_csv',
]);

const METRICS = new Map([
  ['invocations', 'count'],
  ['recommendations', 'count'],
  ['cart_handoffs', 'count'],
  ['cart_conversions', 'count'],
  ['qualifying_purchases', 'count'],
  ['commission_amount', 'usd'],
]);

function normalizeNullable(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text === '' ? null : text;
}

function validTimestamp(value) {
  if (!value) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
}

function stableEventId(record) {
  const basis = [
    record.source,
    record.source_record_id,
    record.account_id,
    record.surface_id,
    record.occurred_at,
    record.metric_name,
    record.category || '',
    record.product_key || '',
    record.asin || '',
  ].join('|');
  return crypto.createHash('sha256').update(basis).digest('hex').slice(0, 24);
}

function validateMetricRecord(input, { importedAt = new Date().toISOString() } = {}) {
  const record = {
    event_id: normalizeNullable(input.event_id),
    source_record_id: normalizeNullable(input.source_record_id),
    source: normalizeNullable(input.source),
    occurred_at: normalizeNullable(input.occurred_at),
    imported_at: normalizeNullable(input.imported_at) || importedAt,
    account_id: normalizeNullable(input.account_id),
    surface_id: normalizeNullable(input.surface_id),
    audience_segment: normalizeNullable(input.audience_segment) || 'all',
    metric_name: normalizeNullable(input.metric_name),
    unit: normalizeNullable(input.unit),
    value: input.value === '' || input.value === null || input.value === undefined ? null : Number(input.value),
    category: normalizeNullable(input.category),
    product_key: normalizeNullable(input.product_key),
    asin: normalizeNullable(input.asin)?.toUpperCase() || null,
    provenance: normalizeNullable(input.provenance),
  };

  const errors = [];
  if (!SOURCES.has(record.source)) errors.push('source');
  if (!record.source_record_id) errors.push('source_record_id');
  if (!record.account_id) errors.push('account_id');
  if (!record.surface_id) errors.push('surface_id');
  if (!validTimestamp(record.occurred_at)) errors.push('occurred_at');
  if (!validTimestamp(record.imported_at)) errors.push('imported_at');
  if (validTimestamp(record.occurred_at) && validTimestamp(record.imported_at)
      && Date.parse(record.occurred_at) > Date.parse(record.imported_at)) errors.push('occurred_at_after_import');
  if (!METRICS.has(record.metric_name)) errors.push('metric_name');
  if (record.metric_name && METRICS.get(record.metric_name) !== record.unit) errors.push('unit');
  if (!Number.isFinite(record.value) || record.value < 0) errors.push('value');
  if (!record.audience_segment) errors.push('audience_segment');
  if (!record.provenance) errors.push('provenance');
  if (record.asin && !/^[A-Z0-9]{10}$/.test(record.asin)) errors.push('asin');

  if (!record.event_id && record.source_record_id) record.event_id = stableEventId(record);

  return { ok: errors.length === 0, errors, record };
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') quoted = true;
    else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (field.length || row.length) {
    row.push(field.replace(/\r$/, ''));
    rows.push(row);
  }

  const nonEmpty = rows.filter((items) => items.some((item) => item.trim() !== ''));
  if (!nonEmpty.length) return [];
  const headers = nonEmpty[0].map((header) => header.trim());
  return nonEmpty.slice(1).map((items) => Object.fromEntries(headers.map((header, index) => [header, items[index] ?? ''])));
}

function ingestCsv(text, options = {}) {
  const seen = new Set();
  const accepted = [];
  const rejected = [];
  const duplicates = [];

  for (const [index, raw] of parseCsv(text).entries()) {
    const result = validateMetricRecord(raw, options);
    if (!result.ok) {
      rejected.push({ row: index + 2, errors: result.errors });
      continue;
    }

    const idempotencyKey = `${result.record.source}|${result.record.source_record_id}`;
    if (seen.has(idempotencyKey)) {
      duplicates.push({ row: index + 2, idempotency_key: idempotencyKey });
      continue;
    }

    seen.add(idempotencyKey);
    accepted.push(result.record);
  }

  return { accepted, rejected, duplicates };
}

function summarizeCommercialMetrics(records) {
  const totals = new Map();
  for (const record of records) {
    const key = record.category || 'all';
    if (!totals.has(key)) totals.set(key, { category: key, recommendations: 0, cart_conversions: 0, qualifying_purchases: 0, commission_amount: 0 });
    const summary = totals.get(key);
    if (Object.hasOwn(summary, record.metric_name)) summary[record.metric_name] += record.value;
  }

  return [...totals.values()].map((summary) => ({
    ...summary,
    cart_conversion_rate: summary.recommendations > 0 ? summary.cart_conversions / summary.recommendations : null,
    purchase_rate: summary.recommendations > 0 ? summary.qualifying_purchases / summary.recommendations : null,
    commission_per_recommendation: summary.recommendations > 0 ? summary.commission_amount / summary.recommendations : null,
  }));
}

module.exports = {
  SOURCES,
  METRICS,
  normalizeNullable,
  validTimestamp,
  stableEventId,
  validateMetricRecord,
  parseCsv,
  ingestCsv,
  summarizeCommercialMetrics,
};
