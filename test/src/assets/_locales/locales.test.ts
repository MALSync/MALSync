import { assert, expect } from 'chai';
import * as fs from 'fs'

describe('Validating locales', function() {
  const dir = './assets/_locales';
  let files: string[];
  try {
    files = fs.readdirSync(dir);
  } catch (err) {
    assert.fail(`Failed to read ${dir}: ${err.message}`);
  }

  files.forEach(folder => {
    it(folder, function() {
      try {
        const file = `${dir}/${folder}/messages.json`;
        
        if (!fs.existsSync(file)) {
          assert.fail(`messages.json not found in ${folder}`);
        }

        let content;
        try {
          content = JSON.parse(fs.readFileSync(file, 'utf8'));
        } catch (parseError) {
          assert.fail(`Invalid JSON in ${folder}/messages.json: ${parseError.message}`);
        }

        if (!content || !content.locale || !content.locale.message) {
          assert.fail(`Missing 'locale.message' field in ${file}`);
        }

        const locale = content.locale.message;
        try {
          const formattedDate = new Date().toLocaleDateString(locale);
          expect(formattedDate).to.be.a('string');
          assert.ok(true, `${locale}' is valid`);
        } catch (localeError) {
          assert.fail(`Invalid locale '${locale}' in ${file}: ${localeError.message}`);
        }
      } catch (error) {
        assert.fail(`Error while processing ${folder}: ${error.message}`);
      }
    });
  });
});