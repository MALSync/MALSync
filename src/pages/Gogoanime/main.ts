import {pageInterface} from "./../pageInterface";

export const Gogoanime: pageInterface = {
    name: 'Gogoanime',
    domain: ['https://gogoanimes.co', 'https://gogoanime.tv'],
    database: 'Gogoanime',
    type: 'anime',
    isSyncPage: function(url){
      if(utils.urlPart(url, 3) === 'category'){
          return false;
      }else{
          return true;
      }
    },
    sync:{
      getTitle: function(url){return Gogoanime.sync.getIdentifier(url)},
      getIdentifier: function(url){return utils.urlPart(url, 3).split('-episode')[0];},
      getOverviewUrl: function(url){return url.split('/').slice(0,3).join('/') + '/category/'+Gogoanime.sync.getIdentifier(url);},
      getEpisode: function(url){return utils.urlPart(url, 3).split('episode-')[1];},
      nextEpUrl: function(url){return Gogoanime.domain + j.$('.anime_video_body_episodes_r a').last().attr('href');}
    },
    overview:{
      getTitle: function(url){return Gogoanime.overview!.getIdentifier(url);},
      getIdentifier: function(url){return utils.urlPart(url, 4);},
      uiSelector: function(selector){selector.prependTo(j.$(".anime_info_body").first());},
      list:{
        elementsSelector: function(){return j.$("#episode_related a");},
        elementUrl: function(selector){return utils.absoluteLink(selector.attr('href').replace(/^ /,''), Gogoanime.domain);},
        elementEp: function(selector){
          var url = Gogoanime.overview!.list!.elementUrl(selector);
          return Gogoanime.sync.getEpisode(url);
        },
        paginationNext: function(){
          var next = false;
          var nextReturn = false;
          j.$(j.$('#episode_page a').get().reverse()).each(function(index, el){
            if(next && !nextReturn){
              el.click();
              nextReturn = true;
              return;
            }
            if(j.$(el).hasClass('active')){
              next = true;
            }
          });
          return nextReturn;
        }
      }
    },
    init(page){
      api.storage.addStyle(require('./style.less').toString());
      if(Gogoanime.isSyncPage(page.url)){
        j.$(document).ready(function(){
          start();
        });
      }else{
        con.log('noSync');
        utils.waitUntilTrue(function(){return j.$('#episode_related').length}, function(){
          start();
        });
      }

      function start(){
        Gogoanime.domain = window.location.protocol+"//"+window.location.hostname;
        page.handlePage();

        j.$('#episode_page').click(function(){
          setTimeout(function(){
            page.handleList();
          }, 500);
        });
      }

    }
};
