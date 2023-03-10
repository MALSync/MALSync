import { meta as _meta } from './pages';

require('ts-node').register({
  project: './tsconfig.node.json',
  files: './globals.d.ts',
});
import { open as _open } from './tsProxy';

export const open = _open;
export function pages(path = '../../src/pages/pages.ts') {
  const pages = _open(path).pages;
  return pages;
}
export function completePages() {
  const pages = _open('../../src/pages/pages.ts').pages;
  return Object.keys(pages).map(key => {
    return {
      key,
      main: pages[key],
      meta: _meta(key),
    };
  });
}
