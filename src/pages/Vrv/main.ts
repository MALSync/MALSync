import {pageInterface} from "./../pageInterface";

var json:any = undefined;
var ident:any = undefined;

var seasonInterval = undefined;

function getSeries(page, overview = ''){
  json = undefined;
  ident = undefined;
  api.request.xhr('GET', page.url).then((response) => {
    con.log(response);
    json = JSON.parse('{'+response.responseText.split('__INITIAL_STATE__ = {')[1].split('};')[0]+'}');
    con.log(json);

    if(overview.length){
      json.seriesPage.seasons.forEach(function(element) {
        if(overview.indexOf(element.json.title) !== -1){
          con.log('Season Found', element);
          ident = element;
        }
      });
    }else{
      if(json.seriesPage.seasons.length){
        con.log('Season', json.seriesPage.seasons[0]);
        ident = json.seriesPage.seasons[0];
      }
    }

    page.handlePage();
  });
}

export const Vrv: pageInterface = {
    name: 'Vrv',
    domain: 'https://vrv.co',
    type: 'anime',
    isSyncPage: function(url){
      if(utils.urlPart(window.location.href, 3) == 'series') return false;
      return true;
    },
    sync:{
      getTitle: function(url){return json.watch.mediaResource.json.series_title+' - '+ json.watch.mediaResource.json.season_title.replace(json.watch.mediaResource.json.series_title, '');},
      getIdentifier: function(url){return json.watch.mediaResource.json.season_id;},
      getOverviewUrl: function(url){return Vrv.domain+'/series/'+json.watch.mediaResource.json.series_id;},
      getEpisode: function(url){return json.watch.mediaResource.json.episode_number;},
      nextEpUrl: function(url){
        if(typeof json.watch.mediaResource.json.next_episode_id === 'undefined') return '';
        return Vrv.domain+'/watch/'+json.watch.mediaResource.json.next_episode_id;
      },
    },
    overview:{
      getTitle: function(url){return json.seriesPage.series.json.title+' - '+ ident.json.title.replace(json.seriesPage.series.json.title, '');},
      getIdentifier: function(url){return ident.json.id;},
      uiSelector: function(selector){
        selector.insertAfter($( '.erc-series-info .series-title' ).first());
      },
    },
    init(page){
      api.storage.addStyle(require('./style.less').toString());
      j.$(document).ready(function(){
        ready();
      });
      utils.urlChangeDetect(function(){
        page.url = window.location.href;
        ready();
      });

      function ready(){
        clearInterval(seasonInterval);
        $('#flashinfo-div, #flash-div-bottom, #flash-div-top, #malp').remove();
        page.UILoaded = false;
        if(utils.urlPart(window.location.href, 3) == 'watch'){
          getSeries(page);
        }
        if(utils.urlPart(window.location.href, 3) == 'series'){
          utils.waitUntilTrue(function(){
            return j.$('.erc-series-info .series-title').first().length;
          }, function(){
            getSeries(page, $('.controls-select-trigger .season-info').text().trim());
            seasonInterval = utils.changeDetect(function(){
              $('#malp').remove();
              page.UILoaded = false;
              getSeries(page, $('.controls-select-trigger .season-info').text().trim());
            }, function(){
              return $('.controls-select-trigger .season-info').text().trim();
            })
          });
        }
      }
    }
};
