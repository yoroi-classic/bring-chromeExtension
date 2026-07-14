#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

fs.mkdirSync(path.resolve(__dirname, '..', 'dist'), { recursive: true });
