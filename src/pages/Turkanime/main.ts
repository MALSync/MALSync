import {pageInterface} from "./../pageInterface";

export const Turkanime: pageInterface = {
    name: 'Turkanime',
    domain: 'http://www.turkanime.tv',
    type: 'anime',
    isSyncPage: function(url){
      if(url.split('/')[3] !== 'video'){
        return false;
      }else{
        return true;
      }
    },
    sync:{
      getTitle: function(url){return j.$('.breadcrumb a').first().text().trim();},
      getIdentifier: function(url){return Turkanime.overview!.getIdentifier(Turkanime.sync.getOverviewUrl(url));},
      getOverviewUrl: function(url){
        return utils.absoluteLink(j.$('.breadcrumb a').first().attr('href'), Turkanime.domain);
      },
      getEpisode: function(url){
        return getEpisode(Turkanime.sync.getIdentifier(url), Turkanime.overview!.getIdentifier(url));
      },
      nextEpUrl: function(url){
        if(j.$('.panel-footer a[href^="video"]').last().attr('href') != j.$('.panel-footer a[href^="video"]').first().attr('href')){
          return utils.absoluteLink(j.$('.panel-footer a[href^="video"]').last().attr('href'), Turkanime.domain);
        }
      },
    },
    overview:{
      getTitle: function(url){return j.$('#detayPaylas .panel-title').first().text().trim();},
      getIdentifier: function(url){return utils.urlPart(url, 4)},
      uiSelector: function(selector){selector.prependTo(j.$("#detayPaylas .panel-body").first());},
      list:{
        offsetHandler: false,
        elementsSelector: function(){return j.$('.list.menum > li');},
        elementUrl: function(selector){return utils.absoluteLink(selector.find("a").last().attr('href').replace(/^\/\//, 'http://'), Turkanime.domain);},
        elementEp: function(selector){
          var url = Turkanime.overview!.list!.elementUrl(selector);
          return getEpisode(Turkanime.overview!.getIdentifier(window.location.href), Turkanime.overview!.getIdentifier(url));
          return Turkanime.sync!.getEpisode(Turkanime.overview!.list!.elementUrl(selector))
        },
      }
    },
    init(page){
      api.storage.addStyle(require('./style.less').toString());
      j.$(document).ready(function(){
        if(Turkanime.isSyncPage(page.url) ){
          page.handlePage();
        }else{
          utils.waitUntilTrue(function(){return j.$('.list.menum').length}, function(){
            page.handlePage();
          });
        }
      });
    }
};

function getEpisode(selector, episodeSelector){
  var diff = episodeSelector.replace(selector, '').replace(/-/g,':');
  con.log('getEpisode', selector, episodeSelector, diff);
  var temp = diff.match(/\d+/);
  if(temp === null){
    return 0
  }else{
    return parseInt(temp[0]);
  }
}
