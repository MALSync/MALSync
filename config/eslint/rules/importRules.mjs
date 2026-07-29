export default /** @type {import('eslint').Linter.FlatConfig} */ ({
  rules: {
    'import-x/no-webpack-loader-syntax': 'off',
    'import-x/prefer-default-export': 'off',
    'import-x/extensions': [
      'error',
      {
        css: 'always',
        js: 'never',
        mjs: 'always',
        cjs: 'always',
        json: 'always',
        svg: 'always',
        ts: 'never',
        vue: 'always',
        less: 'always',
      },
    ],
    'import-x/no-self-import': 'warn',
    'import-x/no-unresolved': [
      'error',
      {
        ignore: ['style\\.less$', 'quicklinks\\.json$'],
      },
    ],
  },
});
