const path = require('path');
const extra = require('fs-extra');
const fs = require('fs');

require('ts-node').register({
  "project": "./tsconfig.node.json",
  "files": "./globals.d.ts"
})

var pages = Object.values(require("./../src/pages/pages.ts").pages);
pages.sort(function(a, b) {
  var textA = a.name.toUpperCase();
  var textB = b.name.toUpperCase();
  return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
});

var hpages = Object.values(require("./../src/pages-adult/pages.ts").pages);
hpages.sort(function(a, b) {
  var textA = a.name.toUpperCase();
  var textB = b.name.toUpperCase();
  return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
});

createTable();
function createTable(){

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

adultDep();
function adultDep(){

  var html = `
  <table>
    <tbody>
      `;
  for (var page in hpages){
    page = hpages[page];

    if(typeof page.domain === 'object') page.domain = page.domain[0];

    html += `<tr>
              <td><a href="${page.domain}"><img src="https://www.google.com/s2/favicons?domain=${page.domain}"> ${page.name}</a></td>
            </tr>`;
  }
  html += `
    </tbody>
  </table>
  `;

  var descFile = path.join(__dirname, '../src/pages-adult/README.md');
  fs.readFile(descFile, 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    var result = data.replace(/<!--pages-->((.|\n|\r)*)<!--\/pages-->/g, '<!--pages-->'+html+'<!--/pages-->');
    console.log(result);

    fs.writeFile(descFile, result, 'utf8', function (err) {
       if (err) return console.log(err);
    });
  });
}
