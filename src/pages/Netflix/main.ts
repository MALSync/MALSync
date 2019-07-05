import {pageInterface} from "./../pageInterface";

var ident:any = undefined;
var ses:any = undefined;

var genres = [
  '2797624',
  '7424',
  '67614',
  '2653',
  '587',
  '625',
  '79307',
  '9302',
  '79488',
  '452',
  '79448',
  '11146',
  '79440',
  '3063',
  '79543',
  '79427',
  '10695',
  '2729',
  '79329',
  '79572',
  '64256',
  '2951909',
]

function getSeries(page){
  var videoId = utils.urlPart(window.location.href, 4);
  var reqUrl = Netflix.domain+'/title/'+videoId;
  api.request.xhr('GET', reqUrl).then((response) => {
    con.log(response);
    var anime = false;
    genres.forEach(function(genre) {
      if(response.responseText.indexOf('"genres","'+genre+'"') !== -1){
        anime = true;
      }
    });
    if(!anime){
      con.info('No Anime');
      return;
    }
    ses = getSeason();
    ident = utils.urlPart(response.finalUrl, 4) + ses;
    page.handlePage();
    $('html').removeClass('miniMAL-hide');
  });

  function getSeason(){
    var sesText = j.$('.ellipsize-text span').first().text().trim();
    var temp = sesText.match(/^(S|St.\ )\d+/);
    if(temp !== null){
      return '?s='+ temp[0].replace(/^\D*/, '').trim();
    }

    temp = sesText.match(/\d+/);
    if(temp !== null){
      return '?s='+ temp[0];
    }
    throw 'No Season found';
  }
}

export const Netflix: pageInterface = {
    name: 'Netflix',
    domain: 'https://www.netflix.com',
    database: 'Netflix',
    type: 'anime',
    isSyncPage: function(url){
      return true;
    },
    sync:{
      getTitle: function(url){return j.$('.ellipsize-text h4').text().trim() + ' Season '+ses.replace('?s=', '');},
      getIdentifier: function(url){return ident;},
      getOverviewUrl: function(url){
        return Netflix.domain+'/title/'+Netflix.sync.getIdentifier(url);
      },
      getEpisode: function(url){
        var epText = j.$('.ellipsize-text span').first().text().trim();
        var temp = epText.match(/\d+$/);
        if(temp !== null){
          return parseInt(temp[0]);
        }
        return 1;

      },
    },
    init(page){
      api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
      j.$(document).ready(function(){
        ready();
      });
      utils.urlChangeDetect(function(){
        ready();
      });

      function ready(){
        $('#flashinfo-div, #flash-div-bottom, #flash-div-top, #malp').remove();
        $('html').addClass('miniMAL-hide');
        if(utils.urlPart(window.location.href, 3) == 'watch'){
          utils.waitUntilTrue(function(){
            return j.$('.ellipsize-text').length;
          }, function(){
            getSeries(page);
          });
        }
      }
    }
};
