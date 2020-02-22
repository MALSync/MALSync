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
      if(thisData && thisData!.title) return thisData!.title;
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
    uiSelector: function(selector){selector.prependTo(j.$("#stats").first());},
  },
  init(page){
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function(){
      ready();
    });
    utils.urlChangeDetect(function(){
      ready();
    });
    $('html').on('click', 'a[data-video-type]', async function(e){
      thisData = null;
      $('#flashinfo-div, #flash-div-bottom, #flash-div-top, #malp').remove();
      $('html').addClass('miniMAL-hide');
      var vidUrl = j.$(this).attr('href');
      var internalId = j.$(this).attr('data-title-id');
      var tempData = await getApi(utils.absoluteLink(j.$(this).attr('href'), PrimeVideo.domain), internalId);
      if(!tempData.genres.includes('av_genre_anime')){
        con.error('Not an Anime');
        return;
      }

      thisData = tempData;
      $('html').removeClass('miniMAL-hide');
      page.handlePage();
    });

    async function ready(){
      thisData = null;
      $('#flashinfo-div, #flash-div-bottom, #flash-div-top, #malp').remove();
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
        if(self && self.titleType === "season" && self.compactGTI) {
          data.id = self.compactGTI;
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
        var detail: any = Object.values(e.props.state.detail.detail)[0];

        if(detail && detail.titleType === "season") {
          if(detail.title) data.title = detail.title;
        }
        if(detail) {
          if(!data.genres.length && detail.genres && detail.genres.length) data.genres = detail.genres.map(e => e.id);
        }
        //Episode
        if(epId && e.props.state.detail.detail.hasOwnProperty(epId)){
          var epDetail = e.props.state.detail.detail[epId];
          if(epDetail.episodeNumber) data.ep = epDetail.episodeNumber;
          if(!data.genres.length && epDetail.genres && epDetail.genres.length) data.genres = epDetail.genres.map(e => e.id);
        }
      }
    },
  ]
  return api.request.xhr('GET', url).then((response) => {
    var templates = response.responseText.match(/<script type="text\/template">.*(?=<\/script>)/g);
    templates = templates.map(e => JSON.parse(e.replace('<script type="text/template">', '')));
    templates.forEach(e => {
      fns.forEach(fn => fn(e));
    });
    con.log('result', data);
    return data;
  });
}
