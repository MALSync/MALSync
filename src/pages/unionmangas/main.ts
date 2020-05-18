import { pageInterface } from "./../pageInterface";

export const unionmangas: pageInterface = {
  name: "unionmangas",
  domain: ["https://unionleitor.top", "https://unionmangas.top"],
  type: "manga",
  isSyncPage: function(url) {
    if (url.split("/")[3] === "leitor" && url.split("/")[5] !== undefined && url.split("/")[5].length > 0) {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){
      return utils.getBaseText($("body > div.breadcrumbs > div > div > a:nth-child(3)")).trim();
    },
    getIdentifier: function(url) {
     return j.$("body > div.breadcrumbs > div > div > a:nth-child(3)").attr("href").split("/")[4].toLowerCase();
   },
   getOverviewUrl: function(url){
    return j.$("body > div.breadcrumbs > div > div > a:nth-child(3)").attr("href");
  },
  getEpisode: function(url){
    return Number(url.split("/")[5]);
  },
  nextEpUrl: function(url){
    var num = $("#capitulo_trocar").find("option:selected").next().attr('value');

    if(!num) return;

    var href = url.replace(/\d+$/, num);

    if(typeof num !== 'undefined' && href !== url){
      return utils.absoluteLink(href, unionmangas.domain);
    }
  },
},
overview:{
  getTitle: function(url){
    return j.$("div.row > div.col-md-12 > h2").first().text().trim();
  },
  getIdentifier: function(url){
    return utils.urlPart(url,4).toLowerCase();
  },
  uiSelector: function(selector){
    selector.insertAfter(j.$("div.row > div.col-md-12 > h2").first());
  },
  list:{
    offsetHandler: false,
    elementsSelector: function(){
      return j.$("div.row.lancamento-linha");
    },
    elementUrl: function(selector){
      return utils.absoluteLink(selector.find('div > a').first().attr('href'),unionmangas.domain);
    },
    elementEp: function(selector){
      return utils.absoluteLink(selector.find('div > a').first().attr('href'),unionmangas.domain).split("/")[5];
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
    if (page.url.split("/")[3] === "leitor" || page.url.split("/")[3] === "perfil-manga") {
      page.handlePage();
    }
  });
}
};
