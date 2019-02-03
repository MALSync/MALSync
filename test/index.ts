import {pages} from "./../src/pages/pages";

//@ts-ignore
window.MalSyncTest = async function(){
  var value:any = {};

  var page = getPage(window.location.href);
  if(!page){
    return 'Page Not Found';
  }
  return new Promise(function(resolve, reject) {
    page.init({url: window.location.href, handlePage(){
      if(page.isSyncPage(window.location.href)){
        value.sync = true;
        value.title = page.sync.getTitle(window.location.href);
        value.identifier = page.sync.getIdentifier(window.location.href);
        value.episode = parseInt(page.sync.getEpisode(window.location.href)+'');
        value.overviewUrl = page.sync.getOverviewUrl(window.location.href);
        if(typeof page.sync.nextEpUrl !== 'undefined'){
          value.nextEpUrl = page.sync.nextEpUrl(window.location.href);
        }
      }else{
        value.sync = false;
        value.title = page.overview.getTitle(window.location.href);
        value.identifier = page.overview.getIdentifier(window.location.href);
      }
      resolve(value);
    }, cdn: function(){
      resolve('retry');
    }});
  });
  return page.domain;

  return $('.link-mal-logo').text().trim();
}

function getPage(url){
  for (var key in pages) {
    var page = pages[key];
    if(j.$.isArray(page.domain)){
      for (var k in page.domain) {
        var singleDomain = page.domain[k];
        if(checkDomain(singleDomain)){
          page.domain = singleDomain;
          return page;
        }
      }
    }else{
      if(checkDomain(page.domain)){
        return page;
      }
    }

    function checkDomain(domain){
      if( url.indexOf(utils.urlPart(domain, 2).split('.').slice(-2, -1)[0] +'.') > -1 ){
        return true;
      }
      return false;
    }

  }
  return null;
}
