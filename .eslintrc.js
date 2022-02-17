/**
 * @type {import("eslint").Linter.RulesRecord}
 */
const COMMON_RULES = {
  // Import rules
  'import/no-webpack-loader-syntax': 'off',
  'import/prefer-default-export': 'off',
  'import/extensions': ['error', 'ignorePackages', { js: 'never', ts: 'never' }],
  // General rules
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
  'vue/no-useless-template-attributes': 'off',
  'no-constructor-return': 'off',
  'import/no-unresolved': ['error', { ignore: ['style\\.less$', 'quicklinks\\.json$'] }],
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
};

/**
 * @type {import("eslint").Linter.Config}
 */
module.exports = {
  env: {
    es6: true,
    greasemonkey: true,
    jquery: true,
    'shared-node-browser': true,
    webextensions: true,
    browser: true,
  },
  extends: ['airbnb-base', 'plugin:es/restrict-to-es2018'],
  globals: {
    api: 'readonly',
    con: 'readonly',
    j: 'readonly',
    utils: 'readonly',
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    'test/dist',
    '*.min.js',
    'docs/',
    'package/',
    'eslint/',
    'test/', // TODO
    'webpackConfig/', // TODO
  ],
  overrides: [
    {
      extends: [
        'eslint:recommended',
        'airbnb-base',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
        'prettier',
      ],
      files: ['*.ts'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint', 'jquery-unsafe-malsync', 'no-unsanitized'],
      rules: {
        ...COMMON_RULES,
        // Import rules
        'import/no-cycle': 'warn', // TODO
        'import/no-self-import': 'warn',
        // TS rules
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
        '@typescript-eslint/no-unused-vars': ['error', { args: 'none' }],
        // General rules
        camelcase: ['error', { allow: ['_'] }],
        'vars-on-top': 'off',
        'global-require': 'warn',
        'no-inner-declarations': 'warn', // TODO
        'no-unreachable': 'warn',
        'no-use-before-define': 'off',
        'no-unsanitized/method': [
          'error',
          {
            escape: {
              methods: ['j.html'],
            },
          },
        ],
        'no-unsanitized/property': [
          'error',
          {
            escape: {
              methods: ['j.html'],
            },
          },
        ],
        // `eslint-plugin-es, rules
        'es/no-nullish-coalescing-operators': 'off',
        'es/no-optional-chaining': 'warn',
        'es/no-regexp-lookbehind-assertions': 'error',
        // Custom rules
        'jquery-unsafe-malsync/no-xss-jquery': 2,
      },
      settings: {
        'import/extensions': ['.js', '.ts'],
        'import/resolver': {
          node: {
            extensions: ['.js', '.ts', '.vue'],
          },
        },
      },
    },
    {
      extends: [
        'plugin:vue/vue3-recommended',
        '@vue/prettier',
        '@vue/eslint-config-typescript/recommended',
      ],
      files: ['*.vue'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
      plugins: ['vue', 'prettier'],
      rules: {
        ...COMMON_RULES,
        'prettier/prettier': ['error', { singleQuote: true }],
        'vue/component-tags-order': 'off',
        'vue/no-v-for-template-key-on-child': 'off',
        'vue/no-deprecated-destroyed-lifecycle': 'off',
        'vue/no-v-html': 'error',
        'vue/multi-word-component-names': 'off',
      },
    },
    {
      extends: ['plugin:prettier/recommended'],
      files: ['*.js'],
      rules: {
        'import/no-extraneous-dependencies': [
          'error',
          {
            devDependencies: true,
          },
        ],
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  root: true,
  rules: {
    'prettier/prettier': ['error', { singleQuote: true }],
    ...COMMON_RULES,
    eqeqeq: ['error', 'always'],
    'no-extend-native': 'off',
    'prefer-template': 'error',
    'no-console': 'off',
    radix: ['error', 'as-needed'],
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts', '.vue'],
      },
    },
  },
};
