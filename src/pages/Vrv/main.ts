import {pageInterface} from "./../pageInterface";

var json:any = undefined;

function getSeries(page){
  api.request.xhr('GET', page.url).then((response) => {
    con.log(response);
    json = JSON.parse('{'+response.responseText.split('__INITIAL_STATE__ = {')[1].split('};')[0]+'}');
    con.log(json);
    page.handlePage();
  });
}

export const Vrv: pageInterface = {
    name: 'Vrv',
    domain: 'https://vrv.co',
    type: 'anime',
    isSyncPage: function(url){
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
        $('#flashinfo-div, #flash-div-bottom, #flash-div-top, #malp').remove();
        if(utils.urlPart(window.location.href, 3) == 'watch'){
          getSeries(page);
        }
      }
    }
};
