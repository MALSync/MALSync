import {pageInterface} from "./../pageInterface";

var item:any = undefined;

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
          page.handlePage();
          break;
        }
      }
    });
  }
}

export const Emby: pageInterface = {
    name: 'Emby',
    domain: 'http://app.emby.media',
    type: 'anime',
    isSyncPage: function(url){return true;},
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
        $('#flashinfo-div, #flash-div-bottom, #flash-div-top').remove();
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
