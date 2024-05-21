import { pageInterface } from '../pageInterface';

export const Latanime: pageInterface = {
  name: 'Latanime',
  domain: 'https://latanime.org',
  languages: ['Spanish'],
  type: 'anime',
  isSyncPage(url) {
    return Boolean(url.split('/')[3] === 'ver');
  },
  isOverviewPage(url) {
    return Boolean(url.split('/')[3] === 'anime');
  },
  sync: {
    getTitle(url) {
      return filterTitle(j.$('h1, h2').first().text().trim());
    },
    getIdentifier(url) {
      return Latanime.overview!.getIdentifier(Latanime.sync.getOverviewUrl(url));
    },
    getOverviewUrl(url) {
      return j.$('.controles a[href*="/anime/"]').first().attr('href')!;
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
      const href = j.$('.controles a[href*="/ver/"]').last().attr('href');
      if (href) {
        if (Latanime.sync.getEpisode(url) < Latanime.sync.getEpisode(href)) {
          return href;
        }
      }
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return filterTitle(j.$('h1, h2').first().text().trim());
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4) || '';
    },
    uiSelector(selector) {
      j.$('h1, h2').first().after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.row a[href*="/ver/"]');
      },
      elementUrl(selector) {
        return selector.attr('href') || '';
      },
      elementEp(selector) {
        return Latanime.sync.getEpisode(Latanime.overview!.list!.elementUrl!(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function () {
      if (document.title.includes('no encontrada')) {
        con.error('404');
        return;
      }
      page.handlePage();
    });
  },
};

function filterTitle(title: string) {
  return title
    .replace(/(castellano|latino)/gi, '')
    .replace(/-[^-]*$/gi, '')
    .replace(/^ver/gi, '')
    .trim();
}
