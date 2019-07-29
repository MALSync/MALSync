const path = require('path');
const extra = require('fs-extra');
const fs = require('fs');

require('ts-node').register({
  "project": "./tsconfig.node.json",
  "files": "./globals.d.ts"
})

var pages = Object.values(require("./../src/pages/pages.ts").pages);

createTable();
function createTable(){
  pages.sort(function(a, b) {
    var textA = a.name.toUpperCase();
    var textB = b.name.toUpperCase();
    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
  });

  var html = `
  <table>
    <thead>
      <tr>
        <th>Page</th>
        <th>Overview Page</th>
        <th>Next Episode</th>
        <th>Database Support</th>
        <th>Update Check</th>
      </tr>
    </thead>
    <tbody>
      `;
  for (var page in pages){
    page = pages[page];

    if(typeof page.domain === 'object') page.domain = page.domain[0];

    html += `<tr>
              <td><a href="${page.domain}"><img src="https://www.google.com/s2/favicons?domain=${page.domain}"> ${page.name}</a></td>
              ${rowCondition(typeof page.overview !== 'undefined')}
              ${rowCondition(typeof page.sync.nextEpUrl !== 'undefined')}
              ${rowCondition(typeof page.database !== 'undefined')}
              ${rowCondition(typeof page.overview !== 'undefined' && typeof page.overview.list !== 'undefined')}
            </tr>`;
  }
  html += `
    </tbody>
  </table>
  `;

  fs.writeFile(path.join(__dirname, '../pages.md'), html, (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  });

  function rowCondition(con){
    if(con) return '<td>:heavy_check_mark:</td>';
    return '<td>:x:</td>';
  }
}

