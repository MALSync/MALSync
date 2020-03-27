import {pageInterface} from "./../../pages/pageInterface";

function cleanTitle(title){
  return title.replace(/(\([^\)]*\)|\[[^\]]*\])/g,'').trim();
}

var inter;

export const Nhentai: pageInterface = {
  name: "Nhentai",
  domain: "https://nhentai.com",
  type: "manga",
  isSyncPage: function(url) {
    if (url.split("/")[6] === "reader"){
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){return cleanTitle(j.$('h5 a').first().text())},
    getIdentifier: function(url) {
      return url.split("/")[5].toLowerCase();
    },
    getOverviewUrl: function(url){
      return utils.absoluteLink(j.$('h5 a').first().attr('href'), Nhentai.domain);
    },
    getEpisode: function(url){
      var episodePart = url.split("/")[5];
      if(episodePart.length){
        var temp = episodePart.match(/(ch|chapter)[^\d]*\d+/gmi);
        if(temp !== null){
          return temp[0].replace(/\D+/g, "");
        }
      }
      return 1;
    },
  },
  overview:{
    getTitle: function(){return cleanTitle(j.$('h5.comic-title').first().text());},
    getIdentifier: function(url){return Nhentai.sync.getIdentifier(url);},
    uiSelector: function(selector){selector.insertAfter(j.$("h5.comic-title").first());},
  },
  init(page){
    if(document.title == "Just a moment..."){
      con.log("loading");
      page.cdn();
      return;
    }
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    start();

    utils.changeDetect(start, () => {return window.location.href.replace(/\d*$/, '')});

    function start() {
      if(page.url.match(/nhentai.[^\/]*\/[^\/]*\/comic\/.+/i)) {
        clearInterval(inter);
        inter = utils.waitUntilTrue(
          function() {
            return j.$('h5 a').first().text() || j.$('h5.comic-title').first().text();
          },
          function() {

            page.handlePage();
          }
        );
      }
    }
  }
};
