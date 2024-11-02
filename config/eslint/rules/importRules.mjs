export default /** @type {import('eslint').Linter.FlatConfig} */ ({
  rules: {
    'import/no-webpack-loader-syntax': 'off',
    'import/prefer-default-export': 'off',
    'import/extensions': [
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
    'import/no-self-import': 'warn',
    'import/no-unresolved': [
      'error',
      {
        ignore: ['style\\.less$', 'quicklinks\\.json$'],
      },
    ],
  },
});
