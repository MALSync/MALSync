import { pageInterface } from "./../pageInterface";

export const Aniflix: pageInterface = {
  name: "Aniflix",
  domain: "https://www.aniflix.tv/",
  type: "anime",
  isSyncPage: function(url) {
    if (url.split("/")[3] === "stream") {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){return j.$("h1.entry-title.extra-bold.h-font-size-30.h1-tablet").text().replace(/Folge.*/gi, "").replace(/staffel/gi,"season").trim();
  },
  getIdentifier: function(url) {
    return url.split("/")[4].replace(/-folge.*/gi, "").trim();
  },
  getOverviewUrl: function(url){
    return j.$("div.categories-wrap a").attr('href');
  },
  getEpisode: function(url){
    var episodePart = j.$("h1.entry-title.extra-bold.h-font-size-30.h1-tablet").text();
    if(episodePart.length){
      var temp = episodePart.match(/Folge.\d*/gi, "");
      if(temp !== null){
        return temp[0].replace(/\D+/g, "");
      }
    }
  },
  uiSelector: function(selector){
    selector.insertAfter(j.$("div.single-post-wrapper.global-single-wrapper dl").first());
  },
},
overview:{
  getTitle: function(url){return j.$("h1.archive-title.h2.extra-bold").text().replace(/ger dub.*/gi, "").replace(/ger sub.*/gi, "").replace(/staffel/gi,"season").trim();},
  getIdentifier: function(url){
    return url.split("/")[5].replace(/-ger-dub.*/gi, "").replace(/-ger-sub.*/gi, "").trim();
  },
  uiSelector: function(selector){
    selector.insertAfter(j.$("div.archive-cat-desc p").first());
  },
},
init(page){
  if(document.title == "Just a moment..."){
    con.log("loading");
    page.cdn();
    return;
  }
  api.storage.addStyle(require('./style.less').toString());
  j.$(document).ready(function(){
    if (page.url.split("/")[3] === "anime"  || page.url.split("/")[3] === "stream" )
      page.handlePage()
  });
}
};
