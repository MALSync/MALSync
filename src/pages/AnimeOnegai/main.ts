import { pageInterface } from '../pageInterface';

let id;
let OVurl;
let Interval;

export const AnimeOnegai: pageInterface = {
  name: 'AnimeOnegai',
  domain: 'https://www.animeonegai.com',
  languages: ['Spanish'],
  type: 'anime',
  isSyncPage(url) {
    if (utils.urlPart(url, 4) === 'watch') {
      if (j.$('div.backButtonAssetInfo > h2').text().trim() !== 'Canal Onegai') return true;
    }

    return false;
  },
  isOverviewPage(url) {
    if (utils.urlPart(url, 4) === 'details') return true;

    return false;
  },
  getImage() {
    return $('img.img-poster').attr('src');
  },
  sync: {
    getTitle(url) {
      return j.$('.backButtonAssetInfo small').text().trim();
    },
    getIdentifier(url) {
      return id;
    },
    getOverviewUrl(url) {
      return OVurl;
    },
    getEpisode(url) {
      const temp = j
        .$('.backButtonAssetInfo h2')
        .text()
        .match(/EP\.\s*(\d+)/i);
      if (!temp) return 0;
      return Number(temp[1]);
    },
  },
  overview: {
    getTitle(url) {
      return j.$('.info h3').text().trim();
    },
    getIdentifier(url) {
      return id;
    },
    uiSelector(selector) {
      j.$('p.description').after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.carouselCSS .tile');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector.find('.details .bottom a').attr('href'),
          AnimeOnegai.domain,
        );
      },
      elementEp(selector) {
        const temp = selector
          .find('.details .bottom p')
          .text()
          .match(/EP\.\s*(\d+)/i);
        if (!temp) return 0;
        return Number(temp[1]);
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function () {
      getData(page);
    });
    utils.urlChangeDetect(function () {
      getData(page);
    });
  },
};

function getData(page) {
  clearInterval(Interval);
  Interval = utils.waitUntilTrue(
    checkLoad,
    async function () {
      page.reset();
      await globals(window.location.href);
      page.handlePage();
    },
    500,
  );
}

function checkLoad() {
  if (
    AnimeOnegai.overview!.getTitle(window.location.href).length > 0 || // Overview data check
    (AnimeOnegai.sync.getTitle(window.location.href).length > 0 &&
      AnimeOnegai.sync.getEpisode(window.location.href) > 0) || // Sync data check
    utils.urlPart(window.location.href, 5) === 'home' // Home check
  ) {
    return true;
  }

  return false;
}

async function globals(url) {
  if (utils.urlPart(url, 4) === 'details') {
    id = await api.request
      .xhr('GET', `https://api.animeonegai.com/v1/asset/entry/${utils.urlPart(url, 5)}`)
      .then(r => {
        return JSON.parse(r.responseText).ID;
      });
  }

  if (utils.urlPart(url, 4) === 'watch') {
    id = await api.request
      .xhr('GET', `https://api.animeonegai.com/v1/chapter/entry/${utils.urlPart(url, 5)}`)
      .then(r => {
        return JSON.parse(r.responseText).asset_id;
      });
    OVurl = `https://www.animeonegai.com/es/details/${await api.request
      .xhr('GET', `https://api.animeonegai.com/v1/asset/${id}`)
      .then(r => {
        return JSON.parse(r.responseText).entry;
      })}`;
  }
}
