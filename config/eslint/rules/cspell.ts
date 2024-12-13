export default /** @type {import('eslint').Linter.Config} */ ({
  rules: {
    '@cspell/spellchecker': [
      'warn',
      {
        customWordListFile: './cspell.json',
      },
    ],
  },
});
