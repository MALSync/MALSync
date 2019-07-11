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
      getTitle: function(url){return j.$('.info h1').text().trim()},
      getIdentifier: function(url){return utils.urlPart(url, 5);},
      getOverviewUrl: function(url){return utils.absoluteLink(j.$('.info a').first().attr('href'), Masterani.domain);},
      getEpisode: function(url){
        return parseInt(utils.urlPart(url, 6))
      },
      nextEpUrl: function(url){
        var nexUrl = Masterani.domain+j.$('#watch .anime-info .actions a').last().attr('href');
        if(!Masterani.isSyncPage(nexUrl)){
          return undefined;
        }
        return nexUrl;
      }
    },
    overview:{
      getTitle: function(url){return Masterani.sync.getIdentifier(url).replace(/^\d*-/,'');},
      getIdentifier: function(url){return Masterani.sync.getIdentifier(url)},
      uiSelector: function(selector){selector.prependTo(j.$("#stats").first());},
      list:{
        offsetHandler: false,
        elementsSelector: function(){return j.$(".episodes .thumbnail");},
        elementUrl: function(selector){return utils.absoluteLink(selector.find('a').first().attr('href'), Masterani.domain);},
        elementEp: function(selector){
          return Masterani.sync.getEpisode(
            Masterani.overview!.list!.elementUrl(selector)
          );
        },
        paginationNext: function(){
          var el = j.$('.pagination .item').last();
          if(el.hasClass('disabled')){
            return false;
          }else{
            el[0].click();
            return true;
          }
        }
      }
    },
    init(page){
      api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
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
