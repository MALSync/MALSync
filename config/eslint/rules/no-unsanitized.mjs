export default /** @type {import('eslint').Linter.FlatConfig} */ ({
  rules: {
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
  },
});
