export default /** @type {import('eslint').Linter.FlatConfig} */ ({
  rules: {
    '@cspell/spellchecker': [
      'warn',
      {
        customWordListFile: './cspell.json',
      },
    ],
  },
});
