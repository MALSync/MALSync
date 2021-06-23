const pagesUtils = require('./pages');

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
  completePages: function() {
    const pages = ts.open('../../src/pages/pages.ts').pages;
    return Object.keys(pages).map(key => {
      return {
        key,
        main: pages[key],
        meta: pagesUtils.meta(key),
      };
    });
  },
};
