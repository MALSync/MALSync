import {pageInterface} from "./../pageInterface";

var item:any = undefined;

async function getApiKey(){
  return api.storage.get('Plex_Api_Key');
}

async function setApiKey(key){
  return api.storage.set('Plex_Api_Key', key);
}

async function getBase(){
  return api.storage.get('Plex_Base');
}

async function setBase(key){
  return api.storage.set('Plex_Base', key);
}

async function urlChange(page){
  var path = utils.urlParam(window.location.href, 'key')
  if(!path) return;
  if(!(path.indexOf('metadata') !== -1)) return;

  apiCall(decodeURIComponent(path)).then((response) => {
    try{
      var data:any = JSON.parse(response.responseText);
    }catch(e){
      con.error(e);
      return;
    }
    con.log(data);
  });
}

//Helper
async function apiCall(url, apiKey = null, base = null){
  if(apiKey === null) apiKey = await getApiKey();
  if(base === null) base = await getBase()
  if(url.indexOf('?') !== -1){
    var pre = '&';
  }else{
    var pre = '?';
  }
  url = base+url+pre+'X-Plex-Token='+apiKey;
  con.log('Api Call', url);
  return api.request.xhr('GET',  {
    url: url,
    headers: {
      'Accept': 'application/json',
    },
  })
}

export const Plex: pageInterface = {
    name: 'Plex',
    domain: 'http://app.plex.tv',
    type: 'anime',
    isSyncPage: function(url){
      if(item.Type === 'Episode'){
        return true;
      }
      return false;
    },
    sync:{
      getTitle: function(url){return item.SeriesName + ((item.ParentIndexNumber > 1) ? ' Season '+item.ParentIndexNumber : '');},
      getIdentifier: function(url){
        if(typeof item.SeasonId !== 'undefined') return item.SeasonId;
        if(typeof item.SeriesId !== 'undefined') return item.SeriesId;
        return item.Id;
      },
      getOverviewUrl: function(url){return Plex.domain + '/#!/itemdetails.html?id=' + Plex.sync.getIdentifier(url);},
      getEpisode: function(url){return item.IndexNumber},
    },
    init(page){
      api.storage.addStyle(require('./style.less').toString());

      utils.changeDetect(() => {
        var href = $('[download]').attr('href');
        var apiBase = href!.split('/').splice(0,3).join('/');
        var apiKey = utils.urlParam(href, 'X-Plex-Token');
        con.info('Set Api', apiBase, apiKey);
        setApiKey(apiKey);
        setBase(apiBase);
      }, () => {
        var src = $('[download]').length;
        return src;
      });

      utils.urlChangeDetect(function(){
        urlChange(page);
      });

      document.addEventListener("fullscreenchange", function() {
        //@ts-ignore
        if((window.fullScreen) || (window.innerWidth == screen.width && window.innerHeight == screen.height)) {
          $('html').addClass('miniMAL-Fullscreen');
        } else {
          $('html').removeClass('miniMAL-Fullscreen');
        }
      });
    }
};
