import {syncPage} from "./pages/syncPage";

function main() {
  var page = new syncPage(window.location.href);
  if (page.page != null) {
    alert(page.page.domain);
  }else{
    alert('nothing to do!');
  }
}

main();

//temp
var log = function () {
    return Function.prototype.bind.call(console.log, console, "%cMal-Sync", "background-color: #2e51a2; color: white; padding: 2px 10px; border-radius: 3px;");
}();

var error = function () {
    return Function.prototype.bind.call(console.error, console, "%cMal-Sync", "background-color: #8f0000; color: white; padding: 2px 10px; border-radius: 3px;");
}();

var info = function () {
    return Function.prototype.bind.call(console.info, console, "%cMal-Sync", "background-color: wheat; color: black; padding: 2px 10px; border-radius: 3px;");
}();
log('log');
error('error');
info('info');
