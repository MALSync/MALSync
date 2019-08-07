import { pageInterface } from "./../pageInterface";

export const NekoSama: pageInterface = {
  name: "NekoSama",
  domain: "https://www.neko-sama.fr",
  type: "anime",
  isSyncPage: function(url) {
    if (j.$("#watch").length) {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){return j.$(".details > div > h1 > a").text()},
    getIdentifier: function(url){return utils.urlPart(url, 5);},
    getOverviewUrl: function(url){return NekoSama.domain+j.$(".details > div > h1 > a").attr('href')},
    getEpisode:function(url){return j.$("#watch > div > div.row.no-gutters.anime-info > div.info > div > div > h2").text().split(" Episode ").pop()},
    nextEpUrl: function(url){return j.$("#watch > div > div:nth-child(2) > div > div.item.right > a.ui.button.small.with-svg-right").attr('href')},
  },

  overview:{
    getTitle: function(url){return utils.getBaseText($('#head > div.content > div > div > div > h1'))},
    getIdentifier: function(url){return NekoSama.sync.getIdentifier(url)},
    uiSelector: function(selector){selector.insertAfter(j.$("#stats > div > div.actions > div").first());},
    list:{
      offsetHandler: false,
      elementsSelector: function(){return j.$("#stats");},
      elementUrl: function(selector){return utils.absoluteLink(selector.find('a').first().attr('href'), NekoSama.domain);},
      elementEp: function(selector){
        return NekoSama.sync.getEpisode(
          NekoSama.overview!.list!.elementUrl(selector)
        );
      },
      paginationNext: function(){
        var el = j.$('#stats > div > div.episodes > div > div > a.animeps-next-page').last();
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

      j.$('.ui.toggle.checkbox, #stats > div > div.episodes > div > div').click(function(){
        setTimeout(function(){
          page.handleList();
        }, 500);
      });

    });
  }
};
