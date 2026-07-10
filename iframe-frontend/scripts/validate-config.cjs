#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const appRoot = path.resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(appRoot, 'package.json'), 'utf8'));
const tsconfig = JSON.parse(fs.readFileSync(path.join(appRoot, 'tsconfig.json'), 'utf8'));
const viteConfigPath = path.join(appRoot, 'vite.config.ts');
const legacyOwnerPattern = new RegExp(['em', 'urgo'].join(''), 'i');

const fail = message => {
  console.error(`Iframe config validation failed: ${message}`);
  process.exitCode = 1;
};

const expectEqual = (actual, expected, label) => {
  if (actual !== expected) {
    fail(`${label} must be ${JSON.stringify(expected)}; received ${JSON.stringify(actual)}`);
  }
};

expectEqual(packageJson.name, 'iframe-frontend', 'package name');
expectEqual(packageJson.private, true, 'private package flag');
expectEqual(packageJson.packageManager, 'yarn@1.22.22', 'package manager');
expectEqual(packageJson.engines?.node, '>=22 <25', 'Node engine');
expectEqual(packageJson.engines?.yarn, '>=1.22.22 <2', 'Yarn engine');

if (legacyOwnerPattern.test(JSON.stringify(packageJson))) {
  fail('active package metadata must not reference legacy ownership');
}

const references = new Set((tsconfig.references ?? []).map(reference => reference.path));
for (const reference of ['./tsconfig.app.json', './tsconfig.node.json']) {
  if (!references.has(reference)) {
    fail(`tsconfig must reference ${reference}`);
  }
}

if (!fs.existsSync(path.join(appRoot, 'index.html'))) {
  fail('index.html must exist for Vite builds');
}

const validateViteBasePath = async () => {
  const originalBasePath = process.env.VITE_BASE_PATH;
  const expectedBasePath = '/validation-base/';

  process.env.VITE_BASE_PATH = expectedBasePath;
  try {
    const { loadConfigFromFile } = await import('vite');
    const result = await loadConfigFromFile(
      { command: 'build', mode: 'production' },
      viteConfigPath
    );

    expectEqual(result?.config?.base, expectedBasePath, 'Vite base path');
  } catch (error) {
    fail(`could not load Vite config: ${error.message}`);
  } finally {
    if (originalBasePath === undefined) {
      delete process.env.VITE_BASE_PATH;
    } else {
      process.env.VITE_BASE_PATH = originalBasePath;
    }
  }
};

validateViteBasePath()
  .then(() => {
    if (process.exitCode) {
      process.exit(process.exitCode);
    }

    console.log('Iframe package config is valid.');
  })
  .catch(error => {
    fail(`unexpected validation failure: ${error.message}`);
    process.exit(process.exitCode);
  });
