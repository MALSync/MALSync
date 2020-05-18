import { pageInterface } from "./../pageInterface";

export const VIZ: pageInterface = {
  name: "VIZ",
  domain: "https://www.viz.com",
  type: "manga",
  isSyncPage: function(url) {
    if ((url.split("/")[3] === "shonenjump" && url.split("/")[5] === "chapter")) {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){return j.$("#product_row > div.bg-lighter-gray.mar-b-md.mar-b-lg--md.chapter_ribbon > div > h3 > a").text()},
    getIdentifier: function(url) {
      return j.$("#product_row > div.bg-lighter-gray.mar-b-md.mar-b-lg--md.chapter_ribbon > div > h3 > a").attr("href").split("/")[3];
    },
    getOverviewUrl: function(url){
      return VIZ.domain+ j.$("#product_row > div.bg-lighter-gray.mar-b-md.mar-b-lg--md.chapter_ribbon > div > h3 > a").attr("href");
    },
    getEpisode: function(url){
      var episodePart = j.$("#product_row > div.bg-lighter-gray.mar-b-md.mar-b-lg--md.chapter_ribbon > div > h3 > span").text();
      if(episodePart.length){
        var temp = episodePart.match(/\d+/gmi);
        if(temp !== null){
          return temp[0];
        }
      }
    },
  },
  overview:{
    getTitle: function(url){
      return j.$("#series-intro > div.clearfix.mar-t-md.mar-b-lg > h2").text().trim();
    },
    getIdentifier: function(url){
      return url.split("/")[5];
    },
    uiSelector: function(selector){selector.insertAfter(j.$("#series-intro").first());},
    list:{
      offsetHandler: false,
      elementsSelector: function(){
        return j.$(".o_sortable-b,.o_sortable");
      },
      elementUrl: function(selector){
        let anchorHref = selector.find('a').first().attr('href');

        if(!anchorHref) return "";

        return VIZ.domain + anchorHref.replace(/javascript:tryReadChapter\(\d+,'/gi,"").replace(/'\);/g,"");
      },
      elementEp: function(selector){
        let anchorHref = selector.find('a').first().attr('href');

        if(!anchorHref || anchorHref !== "javascript:void('join to read');")
          return NaN;
          
        var episodePart = selector.find('td > div.disp-id.mar-r-sm').text();

        if (episodePart.length == 0) {
          episodePart = selector.find('a').first().text().trim();
        }

        if(!episodePart || episodePart.length === 0) throw 'Join to read';

        var temp = episodePart.match(/\d+/gmi);

        if(!temp) return NaN;

        return Number(temp[0]);
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
      if (page.url.split("/")[3] === "shonenjump" && (page.url.split("/")[5] === "chapter" || page.url.split("/")[4] === "chapters")) {
        page.handlePage();
      }
    });
  }
};
