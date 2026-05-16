const fs = require('fs');
const assert = require('assert');

// Simple sanity check: Make sure the file exists, is valid enough.
const html = fs.readFileSync('neon-mythos-boosted (1).html', 'utf8');

assert(html.includes('setConnections(prev => {'));
assert(html.includes('let next = prev.reduce((acc, c) => {'));
assert(!html.includes('setConnections(prev => [...prev, ...newConns].slice(-8));'));

console.log('Sanity checks passed.');
