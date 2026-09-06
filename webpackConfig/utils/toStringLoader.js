/**
 * Webpack pitching loader that converts the output of the next loaders in the
 * chain (e.g. css-loader) into a plain string export instead of a style/module object.
 *
 * Vendored from to-string-loader (https://github.com/gajus/to-string-loader,
 * commit 356751f, BSD-3-Clause, Copyright (c) Gajus Kuizinas) because it was
 * only fetched via a git dependency, which npm 12 disables installing by default.
 * @see https://webpack.js.org/api/loaders/#pitching-loader
 */
module.exports = function toStringLoader() {};

module.exports.pitch = function pitch(remainingRequest) {
  const request = JSON.stringify(this.utils.contextify(this.context, `!!${remainingRequest}`));

  return `
    var result = require(${request});

    if (result && result.__esModule) {
      result = result.default;
    }

    module.exports = typeof result === 'string' ? result : result.toString();
  `;
};
