#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building the project...');
execSync('npm run build', { stdio: 'inherit' });

console.log('Publishing to npmjs.com...');
execSync('npm publish --access public', { stdio: 'inherit' });

console.log('Preparing for GitHub Packages publish...');
// Backup original package.json
fs.copyFileSync(
  path.join(__dirname, '../package.json'),
  path.join(__dirname, '../package.json.backup')
);

// Copy GitHub package.json
fs.copyFileSync(
  path.join(__dirname, '../package.github.json'),
  path.join(__dirname, '../package.json')
);

try {
  console.log('Publishing to GitHub Packages...');
  execSync('npm publish --access public', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to publish to GitHub Packages:', error.message);
} finally {
  // Restore original package.json
  fs.copyFileSync(
    path.join(__dirname, '../package.json.backup'),
    path.join(__dirname, '../package.json')
  );
  fs.unlinkSync(path.join(__dirname, '../package.json.backup'));
}

console.log('Publish process completed!');