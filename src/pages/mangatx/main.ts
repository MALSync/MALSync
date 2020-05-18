import { pageInterface } from "./../pageInterface";

export const mangatx: pageInterface = {
  name: "mangatx",
  domain: "https://mangatx.com",
  type: "manga",
  isSyncPage: function(url) {
    if (url.split("/")[5] !== undefined && url.split("/")[5].length > 0) {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){
      return j.$("div.entry-header.header > div > div.entry-header_wrap > div > div.c-breadcrumb > ol > li:nth-child(2) > a").text().trim()
    },
    getIdentifier: function(url) {
      return url.split("/")[4];
    },
    getOverviewUrl: function(url){
      return j.$("div.entry-header.header > div > div.entry-header_wrap > div > div.c-breadcrumb > ol > li:nth-child(2) > a").attr("href");
    },
    getEpisode: function (url) {
      let urlParts = url.split("/");

      if (!urlParts || urlParts.length === 0) return NaN;

      let episodePart = urlParts[5];

      if (episodePart.length === 0) return NaN;

      let temp = episodePart.match(/chapter-\d+/gmi);

      if (!temp || temp.length === 0) return NaN;

      return Number(temp[0].replace(/\D+/g, ""));
    },
    nextEpUrl: function(url) {
      return j.$("div.entry-header.header > div > div.select-pagination > div.nav-links > div.nav-next > a.next_page").attr("href")
    }
  },
  overview:{
    getTitle: function(url){
      return utils.getBaseText(j.$("div.profile-manga > div > div > div > div.post-title > h1")).trim();
    },
    getIdentifier: function(url){
      return utils.urlPart(url,4);
    },
    uiSelector: function(selector){
      selector.insertAfter(j.$("div.profile-manga > div > div > div > div.post-title > h1").first());
    },
    list:{
      offsetHandler: false,
      elementsSelector: function(){
        return j.$("div.page-content-listing.single-page > div > ul > li.wp-manga-chapter");
      },
      elementUrl: function(selector){
        return utils.absoluteLink(selector.find('a').first().attr('href'),mangatx.domain);
      },
      elementEp: function(selector){
        return mangatx.sync.getEpisode(mangatx.overview!.list!.elementUrl(selector));
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
      if(page.url.split("/")[3] === "manga" && page.url.split("/")[4] !== undefined && page.url.split("/")[4].length > 0) {
        page.handlePage();
      }
    });
  }
};
