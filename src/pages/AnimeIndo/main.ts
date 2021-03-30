import { pageInterface } from '../pageInterface';

export const AnimeIndo: pageInterface = {
  name: 'AnimeIndo',
  domain: 'https://animeindo.net',
  languages: ['Indonesian'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[1] !== null && j.$('#sct_content > div > div.preview')[0]) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('#sct_content > div > div.infobox > h3').text();
    },
    getIdentifier(url) {
      const anchorHref = j.$('#sct_content > div > div.ep_nav.fr > span.nav.all > a').attr('href');

      if (!anchorHref) return '';

      return utils.urlPart(anchorHref, 4);
    },
    getOverviewUrl(url) {
      return j.$('#sct_content > div > div.ep_nav.fr > span.nav.all > a').attr('href') || '';
    },
    getEpisode(url) {
      const urlParts = url.split('/');

      if (!urlParts || urlParts.length === 0) return NaN;

      const episodePart = urlParts[3];

      if (episodePart.length === 0) return NaN;

      const temp = episodePart.match(/-episode-\d*/g);

      if (!temp) return NaN;

      return Number(temp[0].replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      const href = j
        .$('.nav.next a')
        .first()
        .attr('href');
      if (typeof href !== 'undefined') {
        return utils.absoluteLink(href, AnimeIndo.domain);
      }
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('#sct_content > div.nodeinfo > h2')
        .first()
        .text()
        .replace(/sinopsis/gi, '')
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('#sct_content > h1')
        .first()
        .after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('ul.eps_lst,ul#epl').find('li:not(.hdr)');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('a')
            .first()
            .attr('href'),
          AnimeIndo.domain,
        );
      },
      elementEp(selector) {
        return Number(
          selector
            .find('a')
            .first()
            .text()
            .replace(/\D+/g, ''),
        );
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (
        page.url.split('/')[3] === 'anime' ||
        (page.url.split('/')[3] !== null && j.$('#sct_content > div > div.preview')[0])
      ) {
        page.handlePage();
      }
    });
  },
};
