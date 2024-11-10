export default /** @type {import('eslint').Linter.FlatConfig} */ ({
  rules: {
    'vue/no-useless-template-attributes': 'off',
    'vue/component-tags-order': 'off',
    'vue/no-v-for-template-key-on-child': 'off',
    'vue/no-deprecated-destroyed-lifecycle': 'off',
    'vue/no-v-html': 'error',
    'vue/multi-word-component-names': 'off',
    'vue/no-deprecated-filter': 'off',
    'vue/no-setup-props-destructure': 'warn',

    '@typescript-eslint/no-unused-vars': 'off',
    'vue/script-setup-uses-vars': 'error',
  },
});
