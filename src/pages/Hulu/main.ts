import { pageInterface } from "./../pageInterface";

var episode:number = 0;
var season:number = 0;
var huluId:any = undefined;
var name:any = undefined;
var movie:boolean = false;
var nextEp:any = undefined;

export const Hulu: pageInterface = {
  name: "Hulu",
  domain: "https://www.hulu.com",
  type: "anime",
  isSyncPage: function(url) {
    if (url.split("/")[3] === "watch") {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){
      return name
    },
    getIdentifier: function(url) {
      return huluId + "?s=" + season;
    },
    getOverviewUrl: function(url){
      if(movie) {
        return Hulu.domain +"/movie/" + huluId;
      } else {
        return Hulu.domain +"/series/" + huluId;
      }
    },
    getEpisode: function(url){
      return episode;
    },
    nextEpUrl: function(url){
      return nextEp;
    },
  },
  overview:{
    getTitle: function(url){
      if(j.$("div.DetailsDropdown > div > div > button.Select__control > div.Select__single-value").text().replace(/\D+/g, "") > 1) {
        return name + " season "+ j.$("div.DetailsDropdown > div > div > button.Select__control > div.Select__single-value").text().replace(/\D+/g, "");
      }else {
        return name;
      }
    },
    getIdentifier: function(url){
      if(movie) {
        con.log("movie")
        return huluId + "?s=1";

      } else {
        con.log("not a movie")
        return huluId + "?s=" + j.$("div.DetailsDropdown > div > div > button.Select__control > div.Select__single-value").text().replace(/\D+/g, "");
      }
    },
    uiSelector: function(selector){
      selector.insertBefore(j.$("#LevelTwo__scroll-area > div > div > div.Details__subnav").first());
    },
  },
  init(page){
   function startCheck() {
    $('html').addClass('miniMAL-hide');
    if(page.url.split("/")[3] === "watch" || page.url.split("/")[3] === "series" || page.url.split("/")[3] === "movie") {
      utils.waitUntilTrue(function(){
        if(page.url.split("/")[3] !== "series") {
          return true;
        } else {
          return j.$("div.DetailsDropdown > div > div > button.Select__control > div.Select__single-value").text();
        }
      }, async function(){
        if(await checkPage()) {
          page.handlePage();
          $('html').removeClass('miniMAL-hide');
          if(page.url.split("/")[3] === "series") {
            $("body").on('DOMSubtreeModified', "div.DetailsDropdown > div > div > button.Select__control > div.Select__single-value", function() {
              j.$('#malp').remove();
              page.UILoaded = false;
              page.handlePage();
              $('html').removeClass('miniMAL-hide');
            });
          }
        }
      });
    }
  }
  if(document.title == "Just a moment..."){
    con.log("loading");
    page.cdn();
    return;
  }
  api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

  startCheck();

  utils.urlChangeDetect(function() {
    page.url = window.location.href;
    page.UILoaded = false;
    $("#flashinfo-div, #flash-div-bottom, #flash-div-top").remove();
    con.log("url change")
    startCheck();
  });
}
};
function checkPage(): boolean {

  var tempId = utils.urlPart(window.location.href,4)
  var id36 = tempId.substring((tempId.length - 36),tempId.length)

  var reqUrl = "https://discover.hulu.com/content/v3/entity?language=en&eab_ids=" + id36;


  return api.request.xhr('GET', reqUrl).then((response) => {
    var json =JSON.parse(response.responseText)
    if (json.items[0].genre_names.includes("Anime") || json.items[0].genre_names.includes("Animation")) {

      episode = parseInt(json.items[0].number);

      if(json.items[0].season) {
        //if its a series
        huluId = json.items[0].series_id;
        season = parseInt(json.items[0].season);
        name = json.items[0].series_name;
        movie = false;
      } else {
        //if its a movie
        huluId = json.items[0].id;
        season = 1;
        name = json.items[0].name;
        if (window.location.href.split("/")[3] !== "series") {
          movie = true;
        }
      }
      if(season >= 1 && movie == false && window.location.href.split("/")[3] === "watch") {
        var reqUrl2 = "https://discover.hulu.com/content/v4/hubs/series/" + huluId + "/season/"+ season + "?offset=0&limit=999&schema=9&referralHost=production";
        return api.request.xhr('GET', reqUrl2).then((r) => {
         var json2 =JSON.parse(r.responseText)
         if(season > 1) {
           episode = episode - json2.items[0].number + 1;
           name = name + " season " + season;
         }
         if(typeof json2.items[episode + 1] !== undefined) {
          nextEp = Hulu.domain +"/watch/" + json2.items[episode + 1].id;
        } else {
          nextEp = undefined
        }
        con.log(huluId);
        con.log(name);
        con.log("episode: " + episode + " season: " + season);
        return typeof huluId !== 'undefined';
      });
      }
      con.log(huluId);
      con.log(name);
      con.log("episode: " + episode + " season: " + season);
      return typeof huluId !== 'undefined';
    }
  });
}
