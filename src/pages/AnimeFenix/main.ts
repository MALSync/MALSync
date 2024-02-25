import { pageInterface } from '../pageInterface';

export const AnimeFenix: pageInterface = {
  name: 'AnimeFenix',
  domain: 'https://animefenix.tv',
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
      // Update the selector to match AnimeFenix's layout
      return j
        .$('.title')
        .first()
        .text()
        .trim();
    },
    getIdentifier(url) {
      return AnimeFenix.sync.getOverviewUrl(url).split('/')[4];
    },
    getOverviewUrl(url) {
      // Update the selector to match AnimeFenix's layout
      return j.$('.anime-info a').first().attr('href') || '';
    },
    getEpisode(url) {
      const urlParts = url.split('/');

      if (!urlParts || urlParts.length === 0) return NaN;

      const episodePart = urlParts[4];

      if (episodePart.length === 0) return NaN;

      const temp = episodePart.match(/-\d+/gi);

      if (!temp || temp.length === 0) return NaN;

      return Number(temp[0].replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      // Update the selector to match AnimeFenix's layout
      const href = j.$('.next a').first().attr('href');
      if (href) {
        if (AnimeFenix.sync.getEpisode(url) < AnimeFenix.sync.getEpisode(href)) {
          return href;
        }
      }
      return '';
    },
  },
  overview: {
    getTitle(url) {
      // Update the selector to match AnimeFenix's layout
      return j
        .$('.anime-title')
        .first()
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4) || '';
    },
    uiSelector(selector) {
      // Update the selector to match AnimeFenix's layout
      j.$('.anime-info').first().before(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        // Update the selector to match AnimeFenix's layout
        return j.$('.episodes .episode');
      },
      elementUrl(selector) {
        return selector.find('a').first().attr('href') || '';
      },
      elementEp(selector) {
        return AnimeFenix.sync.getEpisode(AnimeFenix.overview!.list!.elementUrl!(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function () {
      if (document.title.includes('AnimeFenix - Anime sub español y latino')) {
        con.error('404');
        return;
      }
      if (page.url.split('/')[3] === 'ver' || page.url.split('/')[3] === 'anime') {
        page.handlePage();
      }
    });
  },
};
