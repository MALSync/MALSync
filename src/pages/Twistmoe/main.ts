import {pageInterface} from "./../pageInterface";

export const Twistmoe: pageInterface = {
    name: 'Twistmoe',
    domain: 'https://twist.moe',
    database: 'Twistmoe',
    type: 'anime',
    isSyncPage: function(url){return true;},
    sync:{
      getTitle: function(url){return j.$('.series-title').text().trim();},
      getIdentifier: function(url){return utils.urlPart(url, 4);},
      getOverviewUrl: function(url){
        return Twistmoe.domain+'/a/'+Twistmoe.sync.getIdentifier(url)+'/1';
        },
      getEpisode: function(url){
        return parseInt(utils.urlPart(url, 5))
      },
      nextEpUrl: function(url){
        return utils.absoluteLink(j.$('.episode-list .current').first().parent().next().find('a').attr('href'), Twistmoe.domain);
      },
      uiSelector: function(selector){selector.insertAfter(j.$(".information").first());},
    },
    overview:{
      getTitle: function(url){return '';},
      getIdentifier: function(url){return '';},
      uiSelector: function(selector){return '';},
      list:{
        offsetHandler: false,
        elementsSelector: function(){return j.$('.episode-list li');},
        elementUrl: function(selector){return utils.absoluteLink(selector.find("a").first().attr('href'), Twistmoe.domain);},
        elementEp: function(selector){return Twistmoe.sync!.getEpisode(Twistmoe.overview!.list!.elementUrl(selector))},
      }
    },
    init(page){
      api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
      j.$(document).ready(function(){
        start();

        utils.urlChangeDetect(function(){
          page.url = window.location.href;
          page.UILoaded = false;
          $('#flashinfo-div, #flash-div-bottom, #flash-div-top').remove();
          start();
        });
      });

      function start(){
        if(utils.urlPart(page.url, 3).toLowerCase() != 'a'){
          con.log('Not an anime page!');
          return;
        }
        page.handlePage();
      }
    }
};
