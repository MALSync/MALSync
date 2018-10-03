import {pageInterface} from "./../pageInterface";

export const nineAnime: pageInterface = {
    name: '9anime',
    domain: 'https://9anime.to',
    database: '9anime',
    type: 'anime',
    isSyncPage: function(url){return true;},
    sync:{
      getTitle: function(url){return url.split("/")[4].split("?")[0].split(".")[0];},
      getIdentifier: function(url){
          url = url.split("/")[4].split("?")[0];
        if( url.indexOf(".") > -1 ){
          url = url.split(".")[1];
        }
        return url;
      },
      getOverviewUrl: function(url){return url.split('/').slice(0,5).join('/');},
      getEpisode: function(url){return parseInt(j.$(".servers .episodes a.active").attr('data-base')!);},
      nextEpUrl: function(url){return nineAnime.domain+j.$(".servers .episodes a.active").parent('li').next().find('a').attr('href');},

      uiSelector: function(selector){j.$('<div class="widget info"><div class="widget-body"> '+selector.html()+'</div></div>').insertBefore(j.$(".widget.info").first());},
    },
    init(page){
      api.storage.addStyle(require('./style.less').toString());
      utils.waitUntilTrue(function(){return j.$('.servers').length}, function(){
        con.info('Start check');
        page.handlePage();
        utils.urlChangeDetect(function(){
          con.info('Check');
          page.handlePage();
        });
      });
    }
};
