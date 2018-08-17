import {syncPage} from "./pages/syncPage";

function main() {
  var page = new syncPage(window.location.href);
  if (page.page != null) {
    alert(page.page.getIdentifier());
  }else{
    alert('nothing to do!');
  }
}

main();

//temp
con.log('log');
con.error('error');
con.info('info');
con.log(utils.urlPart('https://greasyfork.org/de/scripts/27564-kissanimelist/code', 5));

api.storage.set('test', 'test123').then(() => {
  return api.storage.get('test');
}).then((value) => {
  con.log(value);
});

chrome.runtime.sendMessage({name: "xhr", method: "GET", url: "https://myanimelist.net/"}, function(response) {
  con.log(response);
});
