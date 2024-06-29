import { pageInterface } from '../pageInterface';

export const Animefenix: pageInterface = {
  name: 'Animefenix',
  domain: 'https://www.animefenix.tv',
  languages: ['Spanish'],
  type: 'anime',
  isSyncPage(url) {
    if (utils.urlPart(url, 3) === 'ver') return true;
    return false;
  },
  isOverviewPage(url) {
    if (utils.urlPart(url, 3) === 'zerotwo') return false;
    return true;
  },
  sync: {
    getTitle(url) {
      const titleElement = document.querySelector('h1');
      if (titleElement) {
        const titleText = titleElement?.textContent ?? '';
        return (titleText ?? '').split(/\d+ Sub Español/)[0].trim();
      }
      return '';
    },
    getIdentifier(url) {
      const path = url.replace('https://www.animefenix.tv/ver/', '');
      const parts = path.split('-');
      parts.pop(); // Remove the episode number
      return parts.join(''); // Join remaining parts without hyphens
    },
    getOverviewUrl(url) {
      return Animefenix.domain + (j.$('.fa-th-list').attr('href') || '');
    },
    getEpisode(url) {
      const titleElement = document.querySelector('h1');
      if (titleElement) {
        const titleText = titleElement?.textContent ?? '';
        const match = titleText.match(/(\d+) Sub Español/);
        if (match) {
          return parseInt(match[1]);
        }
      }
      return 0;
    },
    nextEpUrl(url) {
      const nextEpElement = document.querySelector('.fa-arrow-circle-right')?.closest('a');
      if (nextEpElement) {
        return nextEpElement.href;
      }
      return undefined;
    },
    uiSelector(selector) {
      j.$('.CapOptns').after(j.html(selector));
    },
  },
  overview: {
    getTitle(url) {
      const titleElement = document.querySelector('h1');
      if (titleElement) {
        const titleText = titleElement.textContent;
        return (titleText?.split(/\d+ Sub Español/) ?? [''])[0].trim();
      }
      return '';
    },
    getIdentifier(url) {
      const path = url.replace('https://www.animefenix.tv/ver/', '');
      const parts = path.split('-');
      parts.pop(); // Remove the episode number
      return parts.join(''); // Join remaining parts without hyphens
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
        return utils.absoluteLink(selector.find('a').first().attr('href'), Animefenix.domain);
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
    if (document.title === 'Verifica que no eres un bot | AnimeFenix') {
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
