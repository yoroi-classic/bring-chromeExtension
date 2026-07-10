#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const extensionRoot = path.resolve(__dirname, '..');
const publicRoot = path.join(extensionRoot, 'public');
const manifestPath = path.join(publicRoot, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const fail = message => {
  console.error(`Manifest validation failed: ${message}`);
  process.exitCode = 1;
};

const expectEqual = (actual, expected, label) => {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    fail(`${label} must be ${JSON.stringify(expected)}; received ${JSON.stringify(actual)}`);
  }
};

expectEqual(manifest.manifest_version, 3, 'manifest_version');
expectEqual(manifest.background?.service_worker, 'background.js', 'background service worker');
expectEqual(manifest.action?.default_popup, 'popup.html', 'action default popup');
expectEqual(manifest.host_permissions, ['https://*.bringweb3.io/*'], 'host permissions');

for (const permission of ['storage', 'tabs']) {
  if (!manifest.permissions?.includes(permission)) {
    fail(`permissions must include ${permission}`);
  }
}

expectEqual(manifest.content_scripts, [
  {
    run_at: 'document_start',
    matches: ['<all_urls>'],
    js: ['contentScript.js'],
    all_frames: true,
  },
], 'content scripts');

for (const size of ['16', '32', '48', '128']) {
  const iconPath = manifest.icons?.[size];
  if (!iconPath) {
    fail(`icons must include ${size}`);
    continue;
  }

  if (!fs.existsSync(path.join(publicRoot, iconPath))) {
    fail(`icon file is missing: ${iconPath}`);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log('Extension manifest is valid.');
