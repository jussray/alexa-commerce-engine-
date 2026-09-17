const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  validateMetricRecord,
  ingestCsv,
  summarizeCommercialMetrics,
} = require('../src/metrics');

test('safe sample CSV ingests with provenance and historical timestamps intact', () => {
  const csv = fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'metrics-sample.csv'), 'utf8');
  const result = ingestCsv(csv, { importedAt: '2026-09-16T12:00:00.000Z' });
  assert.equal(result.accepted.length, 4);
  assert.equal(result.rejected.length, 0);
  assert.equal(result.duplicates.length, 0);
  assert.equal(result.accepted[0].occurred_at, '2026-09-15T12:00:00.000Z');
  assert.match(result.accepted[0].provenance, /Alexa Developer Console/);
});

test('duplicate source records are idempotently ignored', () => {
  const header = 'source_record_id,source,occurred_at,imported_at,account_id,surface_id,audience_segment,metric_name,unit,value,category,product_key,asin,provenance';
  const row = 'same-1,historical_csv,2026-09-15T12:00:00.000Z,2026-09-16T12:00:00.000Z,acct,surface,all,recommendations,count,1,air-fryers,,,safe import';
  const result = ingestCsv(`${header}\n${row}\n${row}\n`);
  assert.equal(result.accepted.length, 1);
  assert.equal(result.duplicates.length, 1);
});

test('wrong units, null value, invalid ASIN, and missing provenance are rejected separately', () => {
  const result = validateMetricRecord({
    source_record_id: 'bad-1',
    source: 'amazon_associates',
    occurred_at: '2026-09-15T12:00:00.000Z',
    imported_at: '2026-09-16T12:00:00.000Z',
    account_id: 'acct',
    surface_id: 'skill',
    audience_segment: 'all',
    metric_name: 'commission_amount',
    unit: 'count',
    value: '',
    asin: 'BAD',
    provenance: '',
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes('unit'));
  assert.ok(result.errors.includes('value'));
  assert.ok(result.errors.includes('asin'));
  assert.ok(result.errors.includes('provenance'));
});

test('commercial summary answers conversion and commission questions by category', () => {
  const csv = fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'metrics-sample.csv'), 'utf8');
  const records = ingestCsv(csv).accepted;
  const [summary] = summarizeCommercialMetrics(records);
  assert.equal(summary.category, 'air-fryers');
  assert.equal(summary.cart_conversion_rate, 0.25);
  assert.equal(summary.purchase_rate, 0.08);
  assert.equal(summary.commission_per_recommendation, 0.114);
});
