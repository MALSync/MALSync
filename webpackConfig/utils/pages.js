const fs = require('fs');
const path = require('path');

module.exports = {
  pages: function() {
    const file = fs.readFileSync(path.join(__dirname, '..', '..', 'src/pages/pages.ts'), { encoding: 'utf-8' });
    const pages = file.match(/from +'[^']+'/g).map(el => el.split("'")[1].split('/')[1]);
    console.log(pages);

    return pages;
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


