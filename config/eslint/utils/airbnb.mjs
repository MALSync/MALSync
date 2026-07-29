/**
 * This repo squashes every preset into a single merged flat-config object
 * (see mergeAllConfig.mjs), so a nested `languageOptions.parserOptions.*`
 * value from one preset can't be overridden by a sibling's top-level
 * `languageOptions.ecmaVersion` the way a real flat-config array would.
 * eslint-config-airbnb-extended pins `parserOptions.ecmaVersion: 2018` on
 * its base rules, which then outlives the repo's own ecmaVersion override
 * and breaks parsing of newer syntax (optional chaining, dynamic import,
 * import.meta, top-level await). Strip it so the repo's own setting wins.
 *
 * It also sets `parserOptions.projectService: true` on its typescript
 * rules, which conflicts with this repo's classic `parserOptions.project`
 * setup (typescript-eslint disallows specifying both). Strip that too.
 *
 * @param {import('eslint').Linter.FlatConfig[]} configs
 * @param {{ stripFiles?: boolean }} [options] stripFiles: drop each config's
 *   own `files` glob so it inherits the outer preset's file scope instead
 *   (needed when reusing these rules for non-.ts/.js files, e.g. .vue).
 * @returns {import('eslint').Linter.FlatConfig[]}
 */
export function adaptAirbnbConfigs(configs, { stripFiles = false } = {}) {
  return configs.map(config => {
    const next = { ...config };

    if (stripFiles) {
      delete next.files;
    }

    const { parserOptions } = next.languageOptions ?? {};
    if (parserOptions) {
      next.languageOptions = { ...next.languageOptions, parserOptions: { ...parserOptions } };
      delete next.languageOptions.parserOptions.ecmaVersion;
      delete next.languageOptions.parserOptions.projectService;
    }

    return next;
  });
}
