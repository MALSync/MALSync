import { pageInterface } from "./../pageInterface";

export const Proxer: pageInterface = {
  name: "Proxer",
  domain: "https://proxer.me",
  database: "Proxer",
  type: "anime",
  isSyncPage: function(url) {
    if (url.split("/")[3] === "watch" || url.split("/")[3] === "read") {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url) {
      if (url.indexOf("watch") != -1) {
        return j
          .$(".wName")
          .text()
          .trim();
      } else {
        if (url.indexOf("read") != -1) {
          return j.$("div#breadcrumb a:first").text();
        }
      }
    },
    getIdentifier: function(url) {
      return url.split("/")[4];
    },
    getOverviewUrl: function(url) {
      return (
        "https://proxer.me/info/" + Proxer.sync.getIdentifier(url) + "/list"
      );
    },
    getEpisode: function(url) {
      return url.split("/")[5];
    },
    nextEpUrl: function(url) {
      return (
        Proxer.domain +
        $(".no_details a")!
          .last()!
          .attr("href")!
      );
    }
  },
  overview:{
    getTitle: function(url){return j.$('#pageMetaAjax').text().split(' - ')[0];},
    getIdentifier: function(url){return Proxer.sync.getIdentifier(url);},
    uiSelector: function(selector){selector.insertAfter(j.$(".hreview-aggregate > span").first());},
  },
  init(page) {
    api.storage.addStyle(require("./style.less").toString());
    if (page.url.split("/")[3] === "watch" || page.url.split("/")[3] === "read") {
      if (page.url.split("/")[3] === "watch") {
        Proxer.type = "anime";
      } else if (page.url.split("/")[3] === "read") {
        Proxer.type = "manga";
      }
      j.$(document).ready(function() {
        page.handlePage();
      });
    }


    ajaxHandle(page);
    utils.urlChangeDetect(function(){
      page.url = window.location.href;
      page.UILoaded = false;
      $('#flashinfo-div, #flash-div-bottom, #flash-div-top').remove();
      ajaxHandle(page);
    });
  }
};

function ajaxHandle(page){
  var detailPart = utils.urlPart(page.url, 5);
  con.info('page', detailPart);
  if(detailPart == 'list'){
    page.handlePage();
  }
  if(detailPart == 'details'){
    utils.waitUntilTrue(function(){
      return j.$(".hreview-aggregate").length;
    }, function(){
      page.handlePage();
    });
  }
}
