import { pageInterface } from "./../pageInterface";

export const JaiminisBox: pageInterface = {
  name: "JaiminisBox",
  domain: "https://jaiminisbox.com",
  type: "manga",
  isSyncPage: function(url) {
    if (url.split("/")[4] === "read" ) {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){
      return j.$("div.tbtitle > div.text > a").first().text();
    },
    getIdentifier: function(url) {
      return JaiminisBox.sync.getOverviewUrl(url).split("/")[5];
    },
    getOverviewUrl: function(url){
      return j.$("div.tbtitle > div.text > a").first().attr("href");
    },
    getEpisode: function(url){
     return url.split("/")[8];
   },
   nextEpUrl: function(url){
    var nextUrl = j.$("div.tbtitle > ul.dropdown > li> a[href='"+j.$("div.tbtitle > div.text > a").eq(1).attr("href")+"']").parent().prev().find("a").attr("href");
    if(nextUrl) {
      return nextUrl;
    } else {
      return undefined;
    }
  },
},
overview:{
  getTitle: function(url){
    return j.$("h1.title").first().text().trim();
  },
  getIdentifier: function(url){
    return utils.urlPart(url,5);
  },
  uiSelector: function(selector){
    selector.insertAfter(j.$("h1.title").first());
  },
  list:{
    offsetHandler: false,
    elementsSelector: function(){
      return j.$("div.group > div.element");
    },
    elementUrl: function(selector){
      return utils.absoluteLink(selector.find('div.title > a').first().attr('href'),JaiminisBox.domain);
    },
    elementEp: function(selector){
      return parseInt(JaiminisBox.overview!.list!.elementUrl(selector).split("/")[8]);
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
    page.handlePage();
  });
}
};
