export default /** @type {import('eslint').Linter.FlatConfig} */ ({
  rules: {
    'block-scoped-var': 'warn', // TODO
    'no-await-in-loop': 'warn', // TODO
    'prefer-destructuring': 'warn', // TODO
    'no-continue': 'off',
    'no-throw-literal': 'off',
    'guard-for-in': 'off',
    'no-param-reassign': 'warn',
    'no-underscore-dangle': 'off',
    'class-methods-use-this': 'off',
    'no-fallthrough': 'off',
    'no-plusplus': 0,
    'no-constructor-return': 'off',
    'no-restricted-syntax': [
      'error',
      // TODO: Reenable rule
      // {
      //  "selector": "ForInStatement",
      //  "message": "for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array."
      // },
      {
        selector: 'ForOfStatement',
        message:
          'iterators/generators require regenerator-runtime, which is too heavyweight for this guide to allow them. Separately, loops should be avoided in favor of array iterations.',
      },
      {
        selector: 'LabeledStatement',
        message:
          'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      },
      {
        selector: 'WithStatement',
        message:
          '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      },
    ],
    camelcase: ['error', { allow: ['_'] }],
    'vars-on-top': 'off',
    'global-require': 'warn',
    'no-inner-declarations': 'warn', // TODO
    'no-unreachable': 'warn',
    'no-use-before-define': 'off',
    eqeqeq: ['error', 'always'],
    'no-extend-native': 'off',
    'prefer-template': 'error',
    'no-console': 'off',
    radix: ['error', 'as-needed'],
  },
});
