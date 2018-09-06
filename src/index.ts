import {syncPage} from "./pages/syncPage";


function main() {
  var page = new syncPage(window.location.href);
  page.init();
}

var css = "font-size: 40px; padding-bottom: 3px; color: white; text-shadow: -1px -1px #2e51a2, 1px -1px #2e51a2, -1px 1px #2e51a2, 1px 1px #2e51a2, 2px 2px #2e51a2, 3px 3px #2e51a2;";
console.log("%cMAL-Sync", css, "Version: 0.0.0");

api.settings.init()
  .then(()=>{
    main();
  });

//temp
/*con.log('log');
con.error('error');
con.info('info');
con.log(utils.urlPart('https://greasyfork.org/de/scripts/27564-kissanimelist/code', 5));

api.storage.set('test', 'test123').then(() => {
  return api.storage.get('test');
}).then((value) => {
  con.log(value);
});

api.request.xhr('GET', 'https://myanimelist.net/').then((response) => {
  con.log(response);
});

const style = require('./style.less').toString();
api.storage.addStyle(style);

$(document).ready(function(){
  utils.flashm('test');
  utils.flashm('test', {type: "test", error: true});
  utils.flashm('permanent', {type: "permanent", permanent: true, position: "top"});
  utils.flashm('permanent hover', {hoverInfo: true});
  setTimeout(function(){
    utils.flashm('test');
    utils.flashm('test', {type: "test", error: true});
    utils.flashm('test', {type: "test", error: true});
    utils.flashm('test', {type: "test", error: true, position: "top"});
    utils.flashm('test', {type: "test", error: true, position: "top"});
    utils.flashm('permanent2', {type: "permanent", permanent: true});
    utils.flashConfirm('Add?', 'add', function(){alert('yes')}, function(){alert('no')});
  }, 3000)
  utils.flashConfirm('Add?', 'add', function(){alert('yes')}, function(){alert('no')});
});*/
