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
      if (url.indexOf("watch") != -1) {
        return getEpisodeFallback('episode '+$('.wEp').last().text().trim(), url.split("/")[5]);
      }else{
        return getEpisodeFallback($('#breadcrumb > a').last().text().trim(), url.split("/")[5]);
      }
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
    list:{
      offsetHandler: false,
      elementsSelector: function(){return j.$('span[id^="listTitle"]').parent().parent();},
      elementUrl: function(selector){return utils.absoluteLink(selector.find('a[href^="/watch"],a[href^="/read"],a[href^="/chapter"]').first().attr('href'), Proxer.domain);},
      elementEp: function(selector){
        return getEpisodeFallback(selector.find('span[id^="listTitle"]').first().text().trim(), Proxer.overview!.list!.elementUrl(selector).split("/")[5] );
      },
      paginationNext: function(updateCheck){
        con.error('sadsad', updateCheck)
        if(updateCheck){
          var el = j.$('.menu').last();
          if(typeof el[0] == 'undefined' || el.hasClass('active')){
            return false;
          }else{
            el[0].click();
            return true;
          }
        }else{
          var el = j.$('.menu.active').first().next();
          if(typeof el[0] == 'undefined'){
            return false;
          }else{
            el[0].click();
            return true;
          }
        }
      }
    }
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

var current = 0;

function ajaxHandle(page){
  if(utils.urlPart(page.url, 3) !== 'info') return;
  var detailPart = utils.urlPart(page.url, 5);
  con.info('page', detailPart);
  if(detailPart == 'list'){
    utils.waitUntilTrue(function(){
      return j.$("#contentList").length;
    }, function(){
      if(j.$('#simple-navi a[href*="manga"]').length){
        Proxer.type = "manga";
      }else{
        Proxer.type = "anime";
      }

      var tempCurrent:number = parseInt(Proxer.overview!.getIdentifier(page.url));
      if(tempCurrent !== current){
        current = tempCurrent;
        page.handlePage();
      }else{
        try{
          page.handleList();
        }catch(e){
          con.error(e);
          page.handlePage();
        }
      }

    });
  }
  if(detailPart == 'details' || typeof detailPart == 'undefined'){
    utils.waitUntilTrue(function(){
      return j.$(".hreview-aggregate").length;
    }, function(){
      current = parseInt(Proxer.overview!.getIdentifier(page.url));
      if(j.$('#simple-navi a[href*="manga"]').length){
        Proxer.type = "manga";
      }else{
        Proxer.type = "anime";
      }
      page.handlePage();
    });
  }
}

function getEpisodeFallback(string, fallback){
  var exclude = string.match(/(special)/gi);
  if(exclude !== null){
    return '';
  }

  var temp = string.match(/(kapitel |ep. |chapter |episode )\d+/gi);
  if(temp !== null){
    return temp[0].match(/\d+/)[0];
  }

  return fallback;
}

/*
Chapter 10
Ep. 10
Kapitel 10
Episode 10
*/

/* Exclude
Special 1
*/
