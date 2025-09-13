// Test that the package can be imported correctly
const exnestSdk = require('./dist/index.js');

console.log('Package imported successfully!');
console.log('Available exports:', Object.keys(exnestSdk));

// Test that we can create instances
try {
  const client = new exnestSdk.ExnestAI({ apiKey: 'ex-sk-5ee5e5fc3e79dcc3eeba0e4ffbf6119b"' });
  console.log('ExnestAI client created successfully!');
  console.log('Client config:', client.getConfig());
  
  const wrapper = new exnestSdk.ExnestWrapper('ex-sk-5ee5e5fc3e79dcc3eeba0e4ffbf6119b"');
  console.log('ExnestWrapper created successfully!');
  console.log('Wrapper base URL:', wrapper.getBaseUrl());
  
  console.log('All tests passed!');
} catch (error) {
  console.error('Error creating instances:', error);
}