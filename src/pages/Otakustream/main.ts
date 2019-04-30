import {pageInterface} from "./../pageInterface";

export const Otakustream: pageInterface = {
    name: 'Otakustream',
    domain: 'https://otakustream.tv',
    type: 'anime',
    isSyncPage: function(url){
      if(url.split('/')[3] === 'movie') return true;
      if(typeof url.split('/')[5] === 'undefined' || url.split('/')[5] == ''){
        return false;
      }else{
        return true;
      }
    },
    sync:{
      getTitle: function(url){
        if(url.split('/')[3] === 'movie') return Otakustream.overview!.getTitle(url);
        return j.$('#breadcrumbs a').last().text().trim();
      },
      getIdentifier: function(url){return utils.urlPart(url, 4).toLowerCase();},
      getOverviewUrl: function(url){return url.split('/').slice(0,5).join('/');},
      getEpisode: function(url){
        var EpText = utils.urlPart(url, 5);
        var temp = EpText.match(/-\d+/);
        if(temp !== null){
            EpText = temp[0];
        }
        temp = EpText.match(/\d+/);
        if(temp === null){
          return 1;
        }
        return parseInt(temp[0]);
      },
      nextEpUrl: function(url){return utils.absoluteLink(j.$('.navigation-right').first().attr('href'), Otakustream.domain);},
    },
    overview:{
      getTitle: function(url){return j.$('.breadcrumb_last').text().trim();},
      getIdentifier: function(url){return Otakustream.sync!.getIdentifier(url);},
      uiSelector: function(selector){selector.insertAfter(j.$(".single-details h1").first());},
      list:{
        offsetHandler: false,
        elementsSelector: function(){return j.$('.ep-list li');},
        elementUrl: function(selector){return utils.absoluteLink(selector.find("a").first().attr('href'), Otakustream.domain);},
        elementEp: function(selector){return Otakustream.sync!.getEpisode(Otakustream.overview!.list!.elementUrl(selector))},
      }
    },
    init(page){
      api.storage.addStyle(require('./style.less').toString());
      j.$(document).ready(function(){
        page.handlePage();
      });
    }
};
