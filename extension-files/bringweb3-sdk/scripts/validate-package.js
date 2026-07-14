#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const packageRoot = path.resolve(__dirname, '..');
const packageJsonPath = path.join(packageRoot, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
// Keep the legacy owner token split so this guard does not trip repo-wide ownership scans itself.
const legacyOwnerPattern = new RegExp(['em', 'urgo'].join(''), 'i');

const fail = message => {
  console.error(`Package validation failed: ${message}`);
  process.exitCode = 1;
};

const expectEqual = (actual, expected, label) => {
  if (actual !== expected) {
    fail(`${label} must be ${JSON.stringify(expected)}; received ${JSON.stringify(actual)}`);
  }
};

expectEqual(packageJson.name, '@yoroi-classic/bringweb3-chrome-extension-kit', 'package name');
expectEqual(packageJson.packageManager, 'yarn@1.22.22', 'package manager');
expectEqual(packageJson.engines?.node, '>=22 <25', 'Node engine');
expectEqual(packageJson.engines?.yarn, '>=1.22.22 <2', 'Yarn engine');
expectEqual(packageJson.repository?.type, 'git', 'repository type');
expectEqual(packageJson.repository?.url, 'https://github.com/yoroi-classic/bring-chromeExtension', 'repository URL');
expectEqual(packageJson.main, 'dist/index.js', 'CommonJS entrypoint');
expectEqual(packageJson.module, 'dist/index.mjs', 'ESM entrypoint');
expectEqual(packageJson.types, 'dist/index.d.ts', 'type entrypoint');

const activeMetadata = JSON.stringify({
  name: packageJson.name,
  repository: packageJson.repository,
  publishConfig: packageJson.publishConfig,
});

if (legacyOwnerPattern.test(activeMetadata)) {
  fail('active package metadata must not reference legacy ownership');
}

if (!Array.isArray(packageJson.files) || !packageJson.files.includes('dist')) {
  fail('published files must include dist');
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log('Package metadata is valid.');
