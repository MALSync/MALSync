const fs = require('fs');
const path = require('path');

module.exports = {
  pages: function() {
    const file = fs.readFileSync(path.join(__dirname, '..', '..', 'src/pages/pages.ts'), { encoding: 'utf-8' });
    const pages = file.match(/from +'[^']+'/g).map(el => el.split("'")[1].split('/')[1]);
    module.exports.pageHealth(pages, file);
    console.log(pages);

    return pages;
  },
  pageHealth: function (pages, file) {
    pages.forEach(el => {
      if (!new RegExp(`\.\/${el}\/`).test(file)) throw `${el} file path could not be found`;
      if (!new RegExp(`import { ${el} }`).test(file)) throw `${el} class could not be found`;
    })
  },
  meta: function (page) {
    return require(path.join(__dirname, '..', '..', 'src/pages/', page, 'meta.json'));
  },
  urls: function (page) {
    return module.exports.meta(page).urls;
  },
  pagesUrls: function () {
    const ps = module.exports.pages();
    const ret = {};
    ps.forEach(p => {
      ret[p] = module.exports.urls(p);
    })
    return ret;
  }
}


