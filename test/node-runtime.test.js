// Simple Node runtime validation test
const assert = require('assert');
try {
  const pkg = require('../dist/index.js');
  // Check some expected exports
  assert(pkg.ExnestAI || pkg.ExnestClient || pkg.ExnestWrapper, 'Expected at least one main export from package');
  console.log('OK: imports resolved and exports found:', Object.keys(pkg));
  process.exit(0);
} catch (err) {
  console.error('ERROR: failed to require dist/index.js ->', err && err.message);
  process.exit(2);
}
