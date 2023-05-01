import { pageInterface } from '../pageInterface';

var id;
var OVurl;
var Interval;

export const AnimeOnegai: pageInterface = {
  name: 'AnimeOnegai',
  domain: 'https://www.animeonegai.com',
  languages: ['Spanish'],
  type: 'anime',
  isSyncPage(url) {
    if (utils.urlPart(url, 4) === 'watch'){
      if(j.$('div.backButtonAssetInfo > h2').text().trim()!='Canal Onegai') return true;
    };

    return false;
  },
  isOverviewPage(url) {
    if (utils.urlPart(url, 4) === 'details') return true;

    return false;
  },
  getImage(){
    return $('div > img.img-poster').attr('src');
  },
  sync: {
    getTitle(url) {
      return j.$('div.backButtonAssetInfo > div > small').text().trim();
    },
    getIdentifier(url) {
      return id;
    },
    getOverviewUrl(url) {
      return OVurl;
    },
    getEpisode(url) {
      let Epi = j.$('div.backButtonAssetInfo > h2').text();
      let Pos = Epi.toUpperCase().indexOf("EP");
      if (Pos != -1){
        Epi = Epi.slice(Pos);
      };
      return Number(Epi.replace(/\D/g,'').trim());
    },
    uiSelector(selector) {
      j.$('div.backButton > div.backButtonAssetInfo > ').first().after(j.html(selector));
    },
  },
  overview: {
    getTitle(url) {
      return j.$('div.info > div > h3').text().trim();
    },
    getIdentifier(url) {
      return id;
    },
    uiSelector(selector) {
      j.$('p.description').after(j.html(selector));
    },
    list:{
      offsetHandler: false,
      elementsSelector() {
        return j.$('div.carouselCSS > div > div.tile');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.find('.details > .bottom > a').attr('href'), AnimeOnegai.domain);
      },
      elementEp(selector) {
        return Number(selector.find('.details > .bottom > p').text().replace(/\D/g,'').trim());
      },
      getTotal() {
        return Number(j.$('div.container-full > div.row > div.col-md > h4').text().replace(/\D/g,'').trim());
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function() {
      conseguir(page);
    });
    utils.urlChangeDetect(function() {
      conseguir(page);
    });

  },
};

function conseguir(page) {
  clearInterval(Interval);
  Interval = utils.waitUntilTrue(carga,async function(){
    page.reset();
    await globals(window.location.href);
    page.handlePage();
  },500);
};

function carga() {
  if (j.$('div.info > div > h3').text().trim().length > 0 || //Overview data check
   ( AnimeOnegai.sync.getTitle(window.location.href).length  > 0 &&  AnimeOnegai.sync.getEpisode(window.location.href).toString().length > 0) || //Sync data check
   utils.urlPart(window.location.href,5) === 'home' //Home check
  ){
    return true;
  }

  return false;
};

async function globals(url) {
  if(utils.urlPart(url, 4) === 'details'){
    id = await api.request.xhr('GET', 'https://api.animeonegai.com/v1/asset/entry/'+utils.urlPart(url, 5)).then( r => {return JSON.parse(r.responseText).ID});
  };

  if(utils.urlPart(url, 4) === 'watch'){
    id = await api.request.xhr('GET', 'https://api.animeonegai.com/v1/chapter/entry/'+utils.urlPart(url, 5)).then( r => {return JSON.parse(r.responseText).asset_id});
    OVurl = 'https://www.animeonegai.com/es/details/' + await api.request.xhr('GET', 'https://api.animeonegai.com/v1/asset/'+id).then( r => {return JSON.parse(r.responseText).entry});
  };
};
