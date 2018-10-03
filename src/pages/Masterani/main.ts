import {pageInterface} from "./../pageInterface";

export const Masterani: pageInterface = {
    name: 'Masterani',
    domain: 'https://www.masterani.me',
    database: 'Masterani',
    type: 'anime',
    isSyncPage: function(url){
      if(url.split('/')[4] !== 'watch'){
        return false;
      }else{
        return true;
      }
    },
    sync:{
      getTitle: function(url){return Masterani.sync.getIdentifier(url).replace(/^\d*-/,'')},
      getIdentifier: function(url){return utils.urlPart(url, 5);},
      getOverviewUrl: function(url){return utils.absoluteLink(j.$('.info a').first().attr('href'), Masterani.domain);},
      getEpisode: function(url){
        return parseInt(utils.urlPart(url, 6))
      },
      nextEpUrl: function(url){return Masterani.domain+j.$('#watch .anime-info .actions a').last().attr('href');}
    },
    overview:{
      getTitle: function(url){return Masterani.sync.getTitle(url);},
      getIdentifier: function(url){return Masterani.sync.getIdentifier(url)},
      uiSelector: function(selector){selector.prependTo(j.$("#stats").first());},
      list:{
        elementsSelector: function(){return j.$(".episodes .thumbnail");},
        elementUrl: function(selector){return utils.absoluteLink(selector.find('a').first().attr('href'), Masterani.domain);},
        elementEp: function(selector){
          return Masterani.sync.getEpisode(
            Masterani.overview!.list!.elementUrl(selector)
          );
        },
      }
    },
    init(page){
      api.storage.addStyle(require('./style.less').toString());
      utils.waitUntilTrue(function(){return j.$('#stats,#watch').length}, function(){
        page.handlePage();

        j.$('.ui.toggle.checkbox, .pagination.menu').click(function(){
          setTimeout(function(){
            page.handleList();
          }, 500);
        });

      });
    }
};
