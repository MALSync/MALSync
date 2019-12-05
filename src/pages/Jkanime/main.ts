/*By kaiserdj*/
var check=0;
import {pageInterface} from "./../pageInterface";

export const Jkanime: pageInterface = {
    name: 'Jkanime',
    domain: 'https://jkanime.net/',
    type: 'anime',
    isSyncPage: function(url){
      if(isNaN(parseInt(utils.urlPart(url, 4))) == true){
        return false;
      }else{
        return true;
      }
    },
    sync:{
      getTitle: function(url){return j.$('.video-header h1').text().split(" - ")[0];},
      getIdentifier: function(url){return utils.urlPart(url, 3);},
      getOverviewUrl: function(url){return j.$('.vnav-list').attr('href');},
      getEpisode: function(url){return j.$('.video-header h1').text().split(" - ")[1];},
      nextEpUrl: function(url){
        var nextUrl = j.$('.vnav-right').attr('href');
        if(nextUrl == '#') return undefined;
        return nextUrl;
      },
      uiSelector: function(selector){selector.insertAfter(j.$(".server-box"));},
    },
    overview:{
      getTitle: function(url){return j.$('.sinopsis-box h2').text();},
      getIdentifier: function(url){return utils.urlPart(url, 3);},
      uiSelector: function(selector){selector.insertAfter(j.$(".sinopsis-links"));},
      list:{
        offsetHandler: false,
        elementsSelector: function(){
          if(!utils.urlPart(window.location.href,4).length) {
          document.body.insertAdjacentHTML( 'afterbegin', '<div id="MALSync" class="MALSync" style="display: none;"><ul id="MALSyncUl" class="MALSyncUl"></ul></div>' );
          var idMALSync = document.getElementById('MALSyncUl');
          var lastEps = j.$('.navigation a').last().text().split('-')[1].trim();
          for(var i=1;i<=lastEps;i++){
            if(idMALSync != null){
              idMALSync.innerHTML += '<li><a href="'+document.URL+i+'" epi="'+i+'"></a> </li>';
            }
          }
          return j.$('.MALSync a');
          } else {
            return j.$('.nowaythisexists123')
          }
        },
          elementUrl: function(selector){return utils.absoluteLink(selector.attr('href'), Jkanime.domain);},
          elementEp: function(selector){return selector.attr('epi')},
          handleListHook: function(epi, epilist){
            epi++;
            if(epilist.length>=epi){
              if(check==0){
                var buttons = j.$('.navigation a');
                for(var i=0; i<buttons.length;i++){
                  if(buttons[i].text.split('-')[0].split()<=epi && buttons[i].text.split('-')[1].split()>=epi){
                    buttons[i].click();
                  }
                }
                check=1;
              }
              setTimeout(function(){
                j.$('#episodes-content .cap-post').each(function(i, obj) {
                  if(obj.innerText.split(' ')[1] == epi){
                    j.$('#episodes-content .cap-post').eq(i).addClass('mal-sync-active');
                    if(check==0){j.$('#episodes-content .cap-post:eq('+ i +')').find('i').first().remove();}
                  }
                });
              }, 500);
            }
          },
      }
    },
    init(page){
      api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
      j.$(document).ready(function(){page.handlePage();});
      j.$('.navigation a').click(function(){
        if(check==1){page.handleList();}
      });
    }
};
