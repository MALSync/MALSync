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
con.log('log');
con.error('error');
con.info('info');
