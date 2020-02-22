import {pageInterface} from "./../pageInterface";
export const PrimeVideo: pageInterface = {
  name: 'Amazon Prime Video',
  domain: 'https://www.primevideo.com',
  type: 'anime',
  isSyncPage: function(url){
    return false;
  },
  sync: {
    getTitle: function(url){return j.$("#navbar-collapse-1 > ul > li:nth-child(1) > a").text()},
    getIdentifier: function(url) {
      return utils.urlPart(url,4);
    },
    getOverviewUrl: function(url){
      return j.$("#navbar-collapse-1 > ul > li:nth-child(1) > a").attr("href");
    },
    getEpisode: function(url){
      return url.split("/")[5];
    },
  },
  overview:{
    getTitle: function(url){return PrimeVideo.sync.getIdentifier(url).replace(/^\d*-/,'');},
    getIdentifier: function(url){return PrimeVideo.sync.getIdentifier(url)},
    uiSelector: function(selector){selector.prependTo(j.$("#stats").first());},
  },
  init(page){
    alert();
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function(){
      ready();
    });
    utils.urlChangeDetect(function(){
      ready();
    });
    $('html').on('click', 'a[data-video-type]', function(e){
      var vidUrl = j.$(this).attr('href');
      getApi(utils.absoluteLink(j.$(this).attr('href'), PrimeVideo.domain));
    });

    async function ready(){
      $('#flashinfo-div, #flash-div-bottom, #flash-div-top, #malp').remove();
      $('html').addClass('miniMAL-hide');
      if(utils.urlPart(window.location.href, 3) === 'detail'){
        getApi(window.location.href);
        return
        utils.waitUntilTrue(function(){
          return j.$('.ellipsize-text').length;
        }, function(){
          //getSeries(page);
        });
      }
    }
  }
};

function getApi(url) {
  var data: any = {
    id: undefined,
    title: undefined,
    genres: [],
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
        var detail: any = Object.values(e.props.state.detail.detail)[0];
      console.log(detail);
        if(detail && detail.titleType === "season") {
          if(detail.title) data.title = detail.title;
          if(detail.genres && detail.genres.length) data.genres = detail.genres.map(e => e.id);
        }
      }
    },
  ]
  return api.request.xhr('GET', url).then((response) => {
    con.log(response);
    var templates = response.responseText.match(/<script type="text\/template">.*(?=<\/script>)/g);
    templates = templates.map(e => JSON.parse(e.replace('<script type="text/template">', '')));
    con.log(templates);
    templates.forEach(e => {
      fns.forEach(fn => fn(e));
    });
    console.log(data);
  });
}
