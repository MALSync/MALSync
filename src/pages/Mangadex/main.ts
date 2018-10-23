import {pageInterface} from "./../pageInterface";

export const Mangadex: pageInterface = {
    name: 'Mangadex',
    domain: 'https://www.mangadex.org',
    database: 'Mangadex',
    type: 'manga',
    isSyncPage: function(url){
      if(url.split('/')[3] !== 'chapter'){
        return false;
      }else{
        return true;
      }
    },
    sync:{
      getTitle: function(url){return j.$('.manga-link').text().trim()},
      getIdentifier: function(url){return utils.urlPart(Mangadex.sync.getOverviewUrl(url), 4);},
      getOverviewUrl: function(url){return utils.absoluteLink(j.$('a.manga-link').first().attr('href'), Mangadex.domain);},
      getEpisode: function(url){
        var chapterId = url.split('/')[4];
        var curOption = j.$('#jump-chapter option[value="'+chapterId+'"]');
        if(curOption.length){
          var temp = curOption.text().trim().match(/ch\.\D?\d+/i);
          if(temp !== null){
            return EpisodePartToEpisode(temp[0]);
          }
        }
        return NaN;
      },
      getVolume: function(url){
        var chapterId = url.split('/')[4];
        var curOption = j.$('#jump-chapter option[value="'+chapterId+'"]');
        if(curOption.length){
          var temp = curOption.text().trim().match(/vol\.\D?\d+/i);
          if(temp !== null){
            temp = temp[0].match(/\d+/);
            if(temp !== null){
              return parseInt(temp[0]);
            }
          }
        }
        return 0;
      },
    },
    overview:{
      getTitle: function(){return j.$('.card-header').first().text().trim();},
      getIdentifier: function(url){return utils.urlPart(url, 4)},
      uiSelector: function(selector){
        j.$(".container .card .edit.row > * > .row").first().after('<div class="row m-0 py-1 px-0 border-top"><div class="col-lg-3 col-xl-2 strong">MyAnimeList:</div><div class="col-lg-9 col-xl-10 kal-ui"></div></div>');
        selector.appendTo(j.$(".container .card .kal-ui").first());
      },
      list:{
        elementsSelector: function(){return j.$(".chapter-container > .row:not(:first-of-type) .chapter-row");},
        elementUrl: function(selector){return utils.absoluteLink(selector.find("a").first().attr('href'), Mangadex.domain);},
        elementEp: function(selector){return selector.attr('data-chapter');},
      }
    },
    init(page){
      api.storage.addStyle(require('./style.less').toString());
      if(j.$('.card-header').length){
        j.$(document).ready(function(){page.handlePage()});
      }else{
        con.info('Waiting');
        utils.waitUntilTrue(function(){return Mangadex.sync.getOverviewUrl('')}, function(){
          con.info('Start');
          page.handlePage();
          var tempChapterId = utils.urlPart(window.location.href, 4);
          utils.urlChangeDetect(function(){
            var newTempChapterId = utils.urlPart(window.location.href , 4)
            if( tempChapterId !== newTempChapterId){
              tempChapterId = newTempChapterId;
              con.info('Check');
              page.handlePage();
            }else{
              con.info('Nothing to do')
            }
          });
        });
      }
    }
};

function EpisodePartToEpisode(string) {
    if(!string) return '';
    if(!(isNaN(parseInt(string)))){
        return string;
    }
    var temp = [];
    temp = string.match(/ch\.\D?\d+/i);
    console.log(temp);
    if(temp !== null){
        string = temp[0];
        temp = string.match(/\d+/);
        if(temp !== null){
            return temp[0];
        }
    }
    return '';
};
