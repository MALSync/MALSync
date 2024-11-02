export default /** @type {import('eslint').Linter.FlatConfig} */ ({
  rules: {
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/ban-types': [
      'off',
      {
        types: {
          // add a custom message to help explain why not to use it
          Object: '',
          '{}': '',
          object: '',
        },
        extendDefaults: true,
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-this-alias': 'warn',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-undef': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { args: 'none' }],
  },
});
