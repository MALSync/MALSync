import { pageInterface } from "./../pageInterface";

export const tmofans: pageInterface = {
  name: "tmofans",
  domain: ["https://lectortmo.com","https://tmofans.com"],
  type: "manga",
  isSyncPage: function(url) {
    if (url.split("/")[3] === "viewer" && url.split("/")[4] !== undefined && url.split("/")[4].length > 0) {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){
      return j.$("#app > section:nth-child(2) > div > div > h1").text().trim();
    },
    getIdentifier: function(url) {
     return j.$("nav.navbar > div > div:nth-child(2) > a").last().attr("href").split("/")[6];
   },
   getOverviewUrl: function(url){
    return j.$("nav.navbar > div > div:nth-child(2) > a").last().attr("href");
  },
  getEpisode: function(url){
    var episodePart = utils.getBaseText($("#app > section:nth-child(2) > div > div > h2").first()).trim()
    if(episodePart.length){
      var temp = episodePart.match(/Capítulo *\d*/gmi);
      if(temp !== null){
        return temp[0].replace(/\D+/g, "");
      }
    }
  }
},
overview:{
  getTitle: function(url){
    return utils.getBaseText($("h1.element-title.my-2").first()).trim();
  },
  getIdentifier: function(url){
    return utils.urlPart(url,6);
  },
  uiSelector: function(selector){
    selector.insertAfter(j.$("header.container-fluid").first());
  },
},
init(page){
  if(document.title == "Just a moment..."){
    con.log("loading");
    page.cdn();
    return;
  }
  api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
  j.$(document).ready(function(){
    if ((page.url.split("/")[3] === "library" && page.url.split("/")[4] !== undefined && page.url.split("/")[4].length > 0) || page.url.split("/")[3] === "viewer") {
      page.handlePage();
    }
  });
}
};
