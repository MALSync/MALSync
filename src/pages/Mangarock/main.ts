import {pageInterface} from "./../pageInterface";

export const Mangarock: pageInterface = {
    name: 'Mangarock',
    domain: 'https://mangarock.com',
    type: 'manga',
    isSyncPage: function(url){
      if(typeof utils.urlPart(url, 5) != 'undefined'){
        return true;
      }
      return false;
    },
    sync:{
      getTitle: function(url){
        return j.$('a[href*="'+Mangarock.overview!.getIdentifier(url)+'"]').text().trim();
      },
      getIdentifier: function(url){return Mangarock.overview!.getIdentifier(url);},
      getOverviewUrl: function(url){return url.split('/').slice(0, 5).join('/')},
      getEpisode: function(url){
        con.log(j.$("option:contains('Chapter')").first().parent().find(':selected').text());
        return EpisodePartToEpisode(j.$("option:contains('Chapter')").first().parent().find(':selected').text())
      },
      getVolume: function(url){//TODO
        return 0;
      },
    },
    overview:{
      getTitle: function(){return j.$('h1').first().text().trim();},
      getIdentifier: function(url){return utils.urlPart(url, 4).replace(/mrs-serie-/i,'')},
      uiSelector: function(selector){
        selector.insertAfter($( "h2:contains('Chapters')" ).first().parent().parent());
      },
      /*list:{
        elementsSelector: function(){return j.$(".chapter-container > .row:not(:first-of-type) .chapter-row");},
        elementUrl: function(selector){return utils.absoluteLink(selector.find("a").first().attr('href'), Mangarock.domain);},
        elementEp: function(selector){return selector.attr('data-chapter');},
      }*/
    },
    init(page){
      api.storage.addStyle(require('./style.less').toString());

      start();

      utils.urlChangeDetect(function(){
        page.url = window.location.href;
        $('#flashinfo-div, #flash-div-bottom, #flash-div-top').remove();
        start();
      });

      function start(){
        if(!/manga/i.test(utils.urlPart(page.url, 3))){
          con.log('Not a manga page!');
          return;
        }
        if(Mangarock.isSyncPage(page.url)){
          utils.waitUntilTrue(function(){return Mangarock.sync.getTitle(page.url)}, function(){
            page.handlePage();
          });
        }else{
          j.$(document).ready(function(){
            page.handlePage();
          });
        }
      }
    }
};

function EpisodePartToEpisode(string) {
  if(!string) return '';
  if(!(isNaN(parseInt(string)))){
      return string;
  }
  var temp = [];
  temp = string.match(/Chapter\ \d+/i);
  con.log(temp);
  if(temp !== null){
      string = temp[0];
      temp = string.match(/\d+/);
      if(temp !== null){
          return temp[0];
      }
  }
  return '';
}
