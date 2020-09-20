import { getEpisode } from '../../_provider/Simkl/helper';
import { pageInterface } from '../pageInterface';

export const BSTO: pageInterface = {
  domain: 'https://bs.to',
  languages: ['German'], // (ISO language name) https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
  name: 'bs.to',
  type: 'anime',

  isSyncPage(url) {
    if (url.split('/')[3] === 'serie') {
      return true;
    }
    return false;
  }, // Return true if the current page is the sync page (Chapter/episode page)
  isOverviewPage(url) {
    if (url.split('/').length === 6) {
      return true;
    }
    return false;
  },
  sync: {
    // Definitions for the sync page
    getTitle(url) {
      let title = j
        .$('h2')[0]
        .innerHTML.split('<small>')[0]
        .trim();
      if (title.split('|').length > 0) {
        title = title.split('|')[0];
      }
      let Volume = Number(url.split('/')[5]);
      return title + ' ' + Volume;
    }, // Returns the title of the anime, used for the search on mal
    getIdentifier(url) {
      return url.split('/')[4];
    }, // An unique identifier of the anime. Has to be the same on the sync and overview page
    getOverviewUrl(url) {
      return url
        .split('/')
        .slice(0, 5)
        .join('/');
    },
    getEpisode(url) {
      return Number(url.split('/')[6].charAt(0));
    }, // Return the recognized episode or chapter number as integer.
    getVolume(url) {
      return Number(url.split('/')[5]);
    }, // (optional) Return the current volume number
    nextEpUrl(url) {
      let currEp = Number(url.split('/')[6].charAt(0));
      let nextEp = currEp + 1;
      let nextEle = <HTMLElement>j.$('.e' + nextEp)[0];
      let nextURL = <HTMLAnchorElement>nextEle.children[0];
      return nextURL.href;
    },
    uiSelector(selector) {
      j.$('p')
        .first()
        .after(j.html(`<div class="container"> ${selector}</div>`));
    },
  },
  overview: {
    getTitle(url) {
      let title = j
        .$('h2')[0]
        .innerHTML.split('<small>')[0]
        .trim();
      return title;
    }, // Returns the title of the anime, used for the search on mal
    getIdentifier(url) {
      return url.split('/')[4];
    }, // An unique identifier of the anime. Has to be the same on the sync and overview page
    uiSelector(selector) {
      j.$('p')
        .first()
        .after(j.html(`<div class="container"> ${selector}</div>`));
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    page.handlePage();
  }, // This is the most important function. It controls when to start the check. Every time c is called it will check the overview/sync page.
};
