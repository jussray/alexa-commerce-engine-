const MAX_LOG_MESSAGE = 240;

function secretValues(env = process.env) {
  const values = [];
  for (const [key, value] of Object.entries(env || {})) {
    if (!value) continue;
    if (/(SECRET|TOKEN|PASSWORD|API[_-]?KEY|ASSOCIATES_ID|TRACKING_ID)/i.test(key)) {
      values.push(String(value));
    }
  }
  return [...new Set(values)].filter(Boolean).sort((a, b) => b.length - a.length);
}

function redactString(value, env = process.env) {
  let output = String(value ?? '');
  for (const secret of secretValues(env)) {
    output = output.split(secret).join('[REDACTED]');
  }
  if (output.length > MAX_LOG_MESSAGE) output = `${output.slice(0, MAX_LOG_MESSAGE)}…`;
  return output;
}

function safeError(error, env = process.env) {
  return {
    name: redactString(error?.name || 'Error', env),
    message: redactString(error?.message || 'Unexpected error', env),
  };
}

module.exports = { redactString, safeError, secretValues };
