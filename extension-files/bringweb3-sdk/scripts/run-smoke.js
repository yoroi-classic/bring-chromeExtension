#!/usr/bin/env node

const { spawnSync } = require('child_process');

const yarn = process.platform === 'win32' ? 'yarn.cmd' : 'yarn';
const result = spawnSync(yarn, ['vitest', 'run', '--coverage=false'], {
  env: {
    ...process.env,
    SMOKE_BUILT_PACKAGE: 'true',
  },
  stdio: 'inherit',
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status === null ? 1 : result.status);
