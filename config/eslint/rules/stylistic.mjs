const prettierCoveredRules = /** @type {import('eslint').Linter.RulesRecord} */ ({
  '@stylistic/indent': 'off',
  '@stylistic/indent-binary-ops': 'off',
  '@stylistic/space-in-parens': 'off',
  '@stylistic/brace-style': 'off',
});

export default /** @type {import('eslint').Linter.FlatConfig} */ ({
  rules: {
    ...prettierCoveredRules,
    '@stylistic/operator-linebreak': [
      'error',
      'after',
      {
        overrides: { '?': 'before', ':': 'before' },
      },
    ],
    '@stylistic/semi-style': ['error', 'last'],
    '@stylistic/semi-spacing': [
      'error',
      {
        after: true,
        before: false,
      },
    ],
    '@stylistic/semi': ['error', 'always'],
    '@stylistic/arrow-parens': ['error', 'as-needed'],
    '@stylistic/quotes': [
      'error',
      'single',
      {
        avoidEscape: true,
      },
    ],
    '@stylistic/member-delimiter-style': [
      'error',
      {
        multiline: {
          requireLast: true,
        },
        singleline: {
          requireLast: false,
        },
      },
    ],
    '@stylistic/quote-props': ['error', 'as-needed'],
  },
});
