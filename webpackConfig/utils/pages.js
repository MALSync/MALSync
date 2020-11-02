const fs = require('fs');
const path = require('path');

module.exports = function() {
  const file = fs.readFileSync(path.join(__dirname, '..', '..', 'src/pages/pages.ts'), { encoding: 'utf-8' });
  const pages = file.match(/from +'[^']+'/g).map(el => el.split("'")[1].split('/')[1]);
  console.log(pages);

  return pages;
};
