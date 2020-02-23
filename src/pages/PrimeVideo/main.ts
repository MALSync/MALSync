import {pageInterface} from "./../pageInterface";

var thisData: any = null;

export const PrimeVideo: pageInterface = {
  name: 'Amazon Prime Video',
  domain: 'https://www.primevideo.com',
  type: 'anime',
  isSyncPage: function(url){
    if(thisData && thisData.ep) return true;
    return false;
  },
  sync: {
    getTitle: function(url){
      if(thisData && thisData!.title) return $('<div/>').html(thisData!.title).text();
      return '';
    },
    getIdentifier: function(url) {
      if(thisData && thisData!.id) return thisData!.id;
      throw 'No Id Found';
    },
    getOverviewUrl: function(url){
      if(thisData && thisData!.id) return 'https://www.primevideo.com/detail/'+thisData!.id;
      throw 'No Id Found';
    },
    getEpisode: function(url){
      if(thisData && thisData!.ep) return thisData!.ep;
      return 1;
    },
  },
  overview:{
    getTitle: function(url){return PrimeVideo.sync.getTitle(url);},
    getIdentifier: function(url){return PrimeVideo.sync.getIdentifier(url)},
    uiSelector: function(selector){selector.insertBefore(j.$("div.av-detail-section > div > h1").first());},
  },
  init(page){
    var epId: any = undefined;
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function(){
      ready();
    });
    utils.urlChangeDetect(function(){
      ready();
    });
    utils.changeDetect(() => {
      if(!j.$('.dv-player-fullscreen').length) ready();
    }, () => {
       return j.$('.dv-player-fullscreen').length;
    })
    utils.changeDetect(async () => {
      if(!epId) {
        con.error('No Episode Id found');
        return;
      }
      thisData = null;
      $('#flashinfo-div, #flash-div-bottom, #flash-div-top, #malp').remove();
      page.UILoaded = false;
      $('html').addClass('miniMAL-hide');
      var tempData = await getApi(utils.absoluteLink(epId.vidUrl, PrimeVideo.domain), epId.internalId);
      if(!tempData.genres.includes('av_genre_anime')){
        con.error('Not an Anime');
        return;
      }

      tempData.ep = null;

      var episodeText = j.$('.dv-player-fullscreen .webPlayer .subtitle').text();
      if(episodeText.length){
        var temp = episodeText.match(/ep..\d*/gmi);
        if(temp !== null){
          tempData.ep = parseInt(temp[0].replace(/\D+/g, ""));
        }
      }

      thisData = tempData;
      $('html').removeClass('miniMAL-hide');
      page.handlePage();
    }, () => {
      var tempT = j.$('.dv-player-fullscreen .webPlayer .subtitle').text();
      if(!tempT) return undefined;
      return tempT;
    })
    $('html').on('click', 'a[data-video-type]', async function(e){
      var vidUrl = j.$(this).attr('href');
      var internalId = j.$(this).attr('data-title-id');
      epId = {
        vidUrl,
        internalId
      };

    });

    async function ready(){
      thisData = null;
      epId = undefined;
      $('#flashinfo-div, #flash-div-bottom, #flash-div-top, #malp').remove();
      page.UILoaded = false;
      $('html').addClass('miniMAL-hide');
      if(utils.urlPart(window.location.href, 3) === 'detail'){
        var tempData = await getApi(window.location.href);
        if(!tempData.genres.includes('av_genre_anime')){
          con.error('Not an Anime');
          return;
        }

        thisData = tempData;
        $('html').removeClass('miniMAL-hide');
        page.handlePage();
      }
    }
  }
};

function getApi(url, epId = 0) {
  con.log('Request Info', url, epId);
  var data: any = {
    id: undefined,
    title: undefined,
    genres: [],
    ep: null,
    gti: undefined
  }
  var fns: any[] = [
    //id
    function(e) {
      if(
        e &&
        e.props &&
        e.props.state &&
        e.props.state.self &&
        Object.keys(e.props.state.self).length
      ) {
        var self: any = Object.values(e.props.state.self)[0];
        if(self && (self.titleType === "season" || self.titleType === "movie") && self.compactGTI && self.gti) {
          data.id = self.compactGTI;
          data.gti = self.gti;
        }
      }
    },
    //title, genres
    function(e) {
      if(
        e &&
        e.props &&
        e.props.state &&
        e.props.state.detail &&
        e.props.state.detail.detail &&
        Object.keys(e.props.state.detail.detail).length
      ) {
        //Parent
        if(data.gti && e.props.state.detail.detail.hasOwnProperty(data.gti)) {
          var detail: any = e.props.state.detail.detail[data.gti];
        } else {
          var detail: any = Object.values(e.props.state.detail.detail)[0];
        }

        if(detail && (detail.titleType === "season" || detail.titleType === "movie")) {
          if(detail.title) data.title = detail.title;
        }
        if(detail) {
          if(!data.genres.length && detail.genres && detail.genres.length) data.genres = detail.genres.map(e => e.id);
        }
        //Episode
        if(epId && e.props.state.detail.detail.hasOwnProperty(epId)){
          var epDetail = e.props.state.detail.detail[epId];
          if(epDetail.episodeNumber) data.ep = epDetail.episodeNumber;
          if(epDetail.entityType === "Movie") data.ep = 1;
          if(!data.genres.length && epDetail.genres && epDetail.genres.length) data.genres = epDetail.genres.map(e => e.id);
        }
      }
    },
  ]
  return api.request.xhr('GET', url).then((response) => {
    var templates = response.responseText.match(/<script type="text\/template">.*(?=<\/script>)/g);
    templates = templates.map(e => JSON.parse(e.replace('<script type="text/template">', '')));
    fns.forEach(fn => {
      templates.forEach(e => fn(e));
    });
    con.log('result', data);
    return data;
  });
}
