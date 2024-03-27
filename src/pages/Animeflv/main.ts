/* By kaiserdj */
import { pageInterface } from '../pageInterface';

export const Animeflv: pageInterface = {
  name: 'Animeflv',
  domain: 'https://animeflv.net',
  languages: ['Spanish'],
  type: 'anime',
  isSyncPage(url) {
    if (utils.urlPart(url, 3) === 'ver') return true;

    return false;
  },
  isOverviewPage(url) {
    if (utils.urlPart(url, 3) === 'anime') return true;

    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('h1.Title').text().split(' Episodio')[0].trim();
    },
    getIdentifier(url) {
      return utils.urlPart(`${Animeflv.domain}${j.$('.fa-th-list').attr('href')}`, 4);
    },
    getOverviewUrl(url) {
      return Animeflv.domain + (j.$('.fa-th-list').attr('href') || '');
    },
    getEpisode(url) {
      return parseInt(j.$('h2.SubTitle').text().replace('Episodio ', '').trim());
    },
    nextEpUrl(url) {
      const nextEp = j.$('.fa-chevron-right').attr('href');
      if (!nextEp) return nextEp;
      return Animeflv.domain + nextEp;
    },
    uiSelector(selector) {
      j.$('.CapOptns').after(j.html(selector));
    },
  },
  overview: {
    getTitle(url) {
      return j.$('h1.Title').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('.Description').after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('#episodeList li:not(.Next)');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.find('a').first().attr('href'), Animeflv.domain);
      },
      elementEp(selector) {
        return Number(selector.find('p').text().replace('Episodio ', '').trim());
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    if (document.title === 'Verifica que no eres un bot | AnimeFLV') {
      con.log('loading');
      page.cdn();
      return;
    }
    if (window.location.hostname.startsWith('m.')) {
      con.error('Mobile not supported');
      return;
    }
    j.$(document).ready(function () {
      page.handlePage();
    });
  },
};
