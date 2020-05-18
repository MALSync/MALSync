import { pageInterface } from "./../pageInterface";

export const MonosChinos: pageInterface = {
  name: "MonosChinos",
  domain: "https://monoschinos.com",
  type: "anime",
  isSyncPage: function(url) {
    if (url.split("/")[3] === "ver") {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){return j.$("h1.Title-epi").text().replace(/(\d+\s+)(Sub|Dub)(\s+Español)$/gi,"").trim()},
    getIdentifier: function(url) {
      return MonosChinos.sync.getOverviewUrl(url).split("/")[4];
    },
    getOverviewUrl: function(url){
      return j.$("a.btnWeb.green.Current").attr("href");
    },
    getEpisode: function (url) {
      let urlParts = url.split("/");
  
      if (!urlParts || urlParts.length === 0) return NaN;
  
      let episodePart = urlParts[4];
  
      if (episodePart.length === 0) return NaN;
  
      let temp = episodePart.match(/episodio-\d+/gi);
  
      if (!temp || temp.length === 0) return NaN;
  
      return Number(temp[0].replace(/\D+/g, ""));
    },
    nextEpUrl: function(url){
      var href = j.$('a.btnWeb:nth-child(3)').first().attr('href');
      if(href){
        if(MonosChinos.sync.getEpisode(url) < MonosChinos.sync.getEpisode(href)) {
          return href;
        }
      }
    },
  },
  overview:{
    getTitle: function(url){
      return j.$("h1.Title").text().replace(/(Sub|Dub)(\s+Español)$/gi,"").trim();
    },
    getIdentifier: function(url){
      return utils.urlPart(url,4);
    },
    uiSelector: function(selector){
      selector.insertBefore(j.$("h1.Title").first());
    },
    list:{
      offsetHandler: false,
      elementsSelector: function(){
        return j.$("div.SerieCaps > a.item");
      },
      elementUrl: function(selector){
        return selector.attr('href') || "";
      },
      elementEp: function(selector){
        return MonosChinos.sync.getEpisode(selector.attr('href'));
      }
    }
  },
  init(page){
    if(document.title == "Just a moment..."){
      con.log("loading");
      page.cdn();
      return;
    }
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function(){
      if(page.url.split("/")[3] === "ver" || page.url.split("/")[3] === "anime") {
        page.handlePage();
      }
    });
  }
};
