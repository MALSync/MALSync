import {pageInterface} from "./../pageInterface";

var item:any = undefined;

async function getApiKey(){
  return api.storage.get('emby_Api_Key');
}

async function setApiKey(key){
  return api.storage.set('emby_Api_Key', key);
}

async function getBase(){
  return api.storage.get('emby_Base');
}

async function setBase(key){
  return api.storage.set('emby_Base', key);
}

function checkApi(page){
  var videoEl = $('video');
  if(videoEl.length){
    var url = videoEl.attr('src');
    con.log(url);
    var apiBase = url!.split('/').splice(0,4).join('/');
    var itemId = utils.urlPart(url, 5);
    var apiKey = utils.urlParam(url, 'api_key');
    con.log('api', apiBase);
    var reqUrl = apiBase+'/Items?ids='+itemId+'&api_key='+apiKey;
    con.log('Emby Api', reqUrl);
    setApiKey(apiKey);
    setBase(apiBase);
    api.request.xhr('GET', reqUrl).then((response) => {
      var data = JSON.parse(response.responseText);
      item = data.Items[0];
      reqUrl = apiBase+'/Genres?Ids='+item.SeriesId+'&api_key='+apiKey;
      con.log(data);
      return api.request.xhr('GET', reqUrl);
    }).then((response) => {
      var genres:any = JSON.parse(response.responseText);
      con.log('genres', genres);
      for (var i = 0; i < genres.Items.length; i++) {
        var genre = genres.Items[i];
        if(genre.Name === 'Anime'){
          con.info('Anime detected')
          page.handlePage();
          break;
        }
      }
    });
  }
}

async function urlChange(page){
  if(window.location.href.indexOf('id=') !== -1){
    var id = utils.urlParam(window.location.href, 'id');
    var reqUrl = '/Items?ids='+id;
    apiCall(reqUrl).then((response) => {
      var data = JSON.parse(response.responseText);
      switch(data.Items[0].Type) {
        case 'Season':
          con.log('Season', data);
          item = data.Items[0];
          reqUrl = '/Genres?Ids='+item.SeriesId;
          apiCall(reqUrl).then((response) => {
            var genres:any = JSON.parse(response.responseText);
            con.log('genres', genres);
            for (var i = 0; i < genres.Items.length; i++) {
              var genre = genres.Items[i];
              if(genre.Name === 'Anime'){
                con.info('Anime detected');
                page.handlePage();
                break;
              }
            }
          });
          break;
        case 'Series':
          con.log('Series', data);
          break;
        default:
          con.log('Not recognized', data);
      }

    });
  }
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
  url = base+url+pre+'api_key='+apiKey;
  con.log('Api Call', url);
  return api.request.xhr('GET', url);
}

export const Emby: pageInterface = {
    name: 'Emby',
    domain: 'http://app.emby.media',
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
      getOverviewUrl: function(url){return Emby.domain + '/#!/itemdetails.html?id=' + Emby.sync.getIdentifier(url);},
      getEpisode: function(url){return item.IndexNumber},
    },
    overview:{
      getTitle: function(url){return item.SeriesName + ((item.IndexNumber > 1) ? ' Season '+item.IndexNumber : '');},
      getIdentifier: function(url){return item.Id;},
      uiSelector: function(selector){selector.appendTo(j.$(".page:not(.hide) .detailSection").first());},
    },
    init(page){
      api.storage.addStyle(require('./style.less').toString());
      utils.changeDetect(() => {
        page.url = window.location.href;
        page.UILoaded = false;
        $('#flashinfo-div, #flash-div-bottom, #flash-div-top').remove();
        checkApi(page);
      }, () => {
        return $('video').first().attr('src');
      });
      utils.urlChangeDetect(function(){
        $('#flashinfo-div, #flash-div-bottom, #flash-div-top, #malp').remove();
        page.UILoaded = false;
        urlChange(page);
      });
      j.$(document).ready(function(){
        utils.waitUntilTrue(function(){
          return j.$('.page').length;
        }, function(){
          urlChange(page);
        });
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
