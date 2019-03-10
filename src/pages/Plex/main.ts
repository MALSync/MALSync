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

async function urlChange(page, curUrl = window.location.href, player = false){
  $('html').addClass('miniMAL-hide');
  var path = utils.urlParam(curUrl, 'key')
  if(!path) return;
  if(!(path.indexOf('metadata') !== -1)) return;

  apiCall(decodeURIComponent(path)).then((response) => {
    if(response.status !== 200){
      con.error('No Api Key');
      $("html").addClass("noApiKey");
      return;
    }
    try{
      var data:any = JSON.parse(response.responseText);
    }catch(e){
      con.error(e);
      $('html').addClass('noApiKey');
      return;
    }

    if(!/(anime|asian)/i.test(data.MediaContainer.librarySectionTitle)){
      con.info('!Not an Anime!');
      return;
    }

    item = data.MediaContainer.Metadata[0];
    switch(item.type) {
      case 'show':
        con.log('Show', data);
        utils.waitUntilTrue(function(){return j.$('[data-qa-id="preplayMainTitle"]').length}, function(){
          page.UILoaded = false;
          page.handlePage(curUrl);
          $('html').removeClass('miniMAL-hide');
        });
        break;
      case 'episode':
        con.log('Episode', data);
        if(player){
          page.handlePage(curUrl);
          $('html').removeClass('miniMAL-hide');
        }
        break;
      default:
        con.log('Not recognized', data);
    }
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
      if(item.type === 'episode'){
        return true;
      }
      return false;
    },
    sync:{
      getTitle: function(url){return item.grandparentTitle + ((item.parentIndex > 1) ? ' Season '+item.parentIndex : '');},
      getIdentifier: function(url){
        if(typeof item.parentKey !== 'undefined') return item.parentKey.split('/')[3];
        if(typeof item.grandparentKey !== 'undefined') return item.grandparentKey.split('/')[3];
        return item.key.split('/')[3];
      },
      getOverviewUrl: function(url){return Plex.domain + $('[class^="AudioVideoPlayerView"] [class*="MetadataPosterTitle"][data-qa-id="metadataTitleLink"]').first().attr('href')!;},
      getEpisode: function(url){return item.index},
    },
    overview:{
      getTitle: function(url){return item.title;},
      getIdentifier: function(url){return item.key.split('/')[3];},
      uiSelector: function(selector){selector.insertAfter(j.$('[data-qa-id="preplayMainTitle"]').first()); },
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
        $('html').removeClass('noApiKey');
      }, () => {
        var src = $('[download]').length;
        return src;
      });

      utils.urlChangeDetect(function(){
        if(!$('[class^="AudioVideoPlayerView"] [class*="MetadataPosterTitle"] [data-qa-id="metadataTitleLink"]').length){
          urlChange(page);
        }
      });

      j.$(document).ready(function(){
        if(!$('[class^="AudioVideoPlayerView"] [class*="MetadataPosterTitle"] [data-qa-id="metadataTitleLink"]').length){
          urlChange(page);
        }
      });

      utils.changeDetect(() => {
        page.UILoaded = false;
        $('#flashinfo-div, #flash-div-bottom, #flash-div-top').remove();
        var metaUrl = $('[class^="AudioVideoPlayerView"] [class*="MetadataPosterTitle"] [data-qa-id="metadataTitleLink"]').first().attr('href');
        if(typeof metaUrl === 'undefined') return;
        urlChange(
          page,
          Plex.domain + metaUrl,
          true
          );
      }, () => {
        var src = $('[class^="AudioVideoPlayerView"] [class*="MetadataPosterTitle"] [data-qa-id="metadataTitleLink"]').first().attr('href');
        if(typeof src === 'undefined') return 'NaN';
        return src;
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
