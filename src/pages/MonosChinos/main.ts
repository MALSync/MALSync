import { pageInterface } from '../pageInterface';

export const MonosChinos: pageInterface = {
  name: 'MonosChinos',
  domain: 'https://monoschinos2.com',
  languages: ['Spanish'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3] === 'ver') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      const regex = /Ver\s+(.*?)\s*(?:-)\s*(\d+)/i;
      const match = j.$('h1').first().text().match(regex);
      
      if (match && match.length === 3) {
        const title = match[1];
        const cleanedTitle = title.trim();
        return cleanedTitle;
      } else {
        return "";
      }
    },
    getIdentifier(url) {
      return MonosChinos.sync.getTitle(url); // Llamar a getTitle para obtener el identificador
    },
    getOverviewUrl(url) {
      return j.$('.lista a').first().attr('href') || '';
    },
    getEpisode(url) {
      const urlParts = url.split('/');

      if (!urlParts || urlParts.length === 0) return NaN;

      const episodePart = urlParts[4];

      if (episodePart.length === 0) return NaN;

      const temp = episodePart.match(/episodio-\d+/gi);

      if (!temp || temp.length === 0) return NaN;

      return Number(temp[0].replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      const href = j.$('.derecha a').first().attr('href');
      if (href) {
        if (MonosChinos.sync.getEpisode(url) < MonosChinos.sync.getEpisode(href)) {
          return href;
        }
      }
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return j.$('h1').first().text().replace(/(Sub|Dub)(\s+Español)$/gi, '').trim();
    },
    getIdentifier(url) {
      return MonosChinos.sync.getTitle(url); // Llamar a getTitle para obtener el identificador
    },
    uiSelector(selector) {
      j.$('.heromain2').first().before(j.$(selector)); 
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.allanimes .col-item');
      },
      elementUrl(selector) {
        return selector.find('a').first().attr('href') || '';
      },
      elementEp(selector) {
        return MonosChinos.sync.getEpisode(MonosChinos.overview!.list!.elementUrl!(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function () { 
      if (document.title.includes('MonosChinos - Anime sub español y latino')) {
        con.error('404');
        return;
      }
      if (page.url.split('/')[3] === 'ver' || page.url.split('/')[3] === 'anime') {
        page.handlePage();
      }
    });
  },
};
