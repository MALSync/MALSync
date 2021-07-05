// @ts-ignore
global.con = require('../../src/utils/console');
// @ts-ignore
global.utils = require('../../src/utils/general');
// @ts-ignore
global.window = {
  crypto: {
    // @ts-ignore
    getRandomValues: () => {},
  },
};

export function open(path: string) {
  return require(path);
}
