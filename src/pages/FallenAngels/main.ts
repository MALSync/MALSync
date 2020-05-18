import { pageInterface } from "./../pageInterface";

export const FallenAngels: pageInterface = {
  name: "FallenAngels",
  domain: "https://manga.fascans.com/",
  type: "manga",
  isSyncPage: function(url) {
    if (url.split("/")[5] !== undefined && url.split("/")[5].length > 0) {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){return j.$("#navbar-collapse-1 > ul > li:nth-child(1) > a").text().replace(/manga$/gi,"").trim()},
    getIdentifier: function(url) {
     return utils.urlPart(url,4);
   },
   getOverviewUrl: function(url){
    return j.$("#navbar-collapse-1 > ul > li:nth-child(1) > a").attr("href") || "";
  },
  getEpisode: function(url){
    return Number(url.split("/")[5]);
  },
  nextEpUrl: function(url){
    var scriptContent = j.$("body > div.container-fluid > script").html();
    const nextChapterMatches = scriptContent.match(/next_chapter\s*=\s*".*"/gmi);

    if(!nextChapterMatches || nextChapterMatches.length === 0) return;

    const matchesOfRestOfNextChapter = nextChapterMatches[0].match(/"(.*?)"/gm);

    if(!matchesOfRestOfNextChapter || matchesOfRestOfNextChapter.length === 0)
      return;

    return matchesOfRestOfNextChapter[0].replace(/(^"|"$)/gm, '');
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
      return utils.absoluteLink(selector.find('h5 > a').first().attr('href'),FallenAngels.domain);
    },
    elementEp: function(selector){
      return utils.absoluteLink(selector.find('h5 > a').first().attr('href'),FallenAngels.domain).split("/")[5];
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
