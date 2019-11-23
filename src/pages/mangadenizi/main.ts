import { pageInterface } from "./../pageInterface";

export const mangadenizi: pageInterface = {
  name: "mangadenizi (Bad)",
  domain: "https://mangadenizi.com",
  type: "manga",
  isSyncPage: function(url) {
    if (url.split("/")[5] !== undefined && url.split("/")[5].length > 0) {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){return j.$("#navbar-collapse-1 > ul > li:nth-child(1) > a").text()},
    getIdentifier: function(url) {
     return utils.urlPart(url,4);
   },
   getOverviewUrl: function(url){
    return j.$("#navbar-collapse-1 > ul > li:nth-child(1) > a").attr("href");
  },
  getEpisode: function(url){
    return url.split("/")[5];
  },
  nextEpUrl: function(url){
    var script = j.$("body > div.container-fluid > script")[0].innerHTML;
    script = script.match(/next_chapter\s*=\s*".*"/gmi)
    script = script[0].match(/"(.*?)"/gm);
    script = script[0].replace(/(^"|"$)/gm, '');
    if(script) {
      return script;
    }
  }
},
overview:{
  getTitle: function(url){
    return j.$("h2.widget-title").first().text();
  },
  getIdentifier: function(url){
    return utils.urlPart(url,4);
  },
  uiSelector: function(selector){
    selector.insertAfter(j.$("h2.widget-title").first());
  },
  list:{
    offsetHandler: false,
    elementsSelector: function(){
      return j.$("ul.chapters > li");
    },
    elementUrl: function(selector){
      return utils.absoluteLink(selector.find('h5 > a').first().attr('href'),mangadenizi.domain);
    },
    elementEp: function(selector){
      return utils.absoluteLink(selector.find('h5 > a').first().attr('href'),mangadenizi.domain).split("/")[5];
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
    if (page.url.split("/")[3] === "manga") {
      page.handlePage();
    }
  });
}
};
