import {pageInterface} from "./../pageInterface";

export const nineAnime: pageInterface = {
    name: '9anime',
    domain: 'https://9anime.to',
    database: '9anime',
    type: 'anime',
    isSyncPage: function(url){return true;},
    sync:{
      getTitle: function(url){return j.$('h1.title').text();},
      getIdentifier: function(url){
          url = url.split("/")[4].split("?")[0];
        if( url.indexOf(".") > -1 ){
          url = url.split(".")[1];
        }
        return url;
      },
      getOverviewUrl: function(url){return url.split('/').slice(0,5).join('/');},
      getEpisode: function(url){return parseInt(j.$(".servers .episodes a.active").attr('data-base')!);},
      nextEpUrl: function(url){
        var nextEp = j.$(".servers .episodes a.active").parent('li').next().find('a').attr('href');
        if(!nextEp) return nextEp;
        return nineAnime.domain + nextEp;
      },
      uiSelector: function(selector){j.$('<div class="widget info"><div class="widget-body"> <p id="malp">'+selector.html()+'</p></div></div>').insertBefore(j.$(".widget.info").first());},
    },
    overview:{
      getTitle: function(url){return '';},
      getIdentifier: function(url){return '';},
      uiSelector: function(selector){},
      list:{
        offsetHandler: false,
        elementsSelector: function(){return j.$(".episodes.range a");},
        elementUrl: function(selector){return utils.absoluteLink(selector.attr('href'), nineAnime.domain);},
        elementEp: function(selector){return selector.attr('data-base')},
      }
    },
    init(page){
      api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
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
