require('ts-node').register({
  project: './tsconfig.node.json',
  files: './globals.d.ts',
});
const ts = require('./tsProxy');

module.exports = {
  open: ts.open,
  pages: function(path = '../../src/pages/pages.ts') {
    const pages = ts.open(path).pages;
    return pages;
  },
};
