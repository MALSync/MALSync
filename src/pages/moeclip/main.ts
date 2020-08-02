import { pageInterface } from '../pageInterface';

export const moeclip: pageInterface = {
  name: 'moeclip',
  domain: 'https://moeclip.com',
  languages: ['Indonesian'],
  type: 'anime',
  isSyncPage(url) {
    if (j.$('div.video-content')[0] && j.$('h1.entry-title.title-font')[0]) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$('header h1.entry-title.title-font')
        .text()
        .replace(/\d+\ssub\s*indo/gim, '')
        .trim();
    },
    getIdentifier(url) {
      return url
        .split('/')[3]
        .replace(/-\d*-sub-indo.*/gim, '')
        .trim();
    },
    getOverviewUrl(url) {
      return `${moeclip.domain}/anime/${moeclip.sync.getIdentifier(url)}`;
    },
    getEpisode(url) {
      const urlParts = url.split('/');

      if (!urlParts || urlParts.length === 0) return NaN;

      const episodePart = urlParts[3];

      if (episodePart.length === 0) return NaN;

      const temp = episodePart.match(/-\d*-sub-indo.*/gim);

      if (!temp || temp.length === 0) return NaN;

      return Number(temp[0].replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      return j
        .$('div.episode-nav > div.select-episode > div:nth-child(3) > a')
        .first()
        .attr('href');
    },
  },
  overview: {
    getTitle(url) {
      return utils
        .getBaseText($('#data2 > div:nth-child(2)'))
        .trim()
        .replace(/:[ ]*/g, '');
    },
    getIdentifier(url) {
      return url
        .split('/')[4]
        .replace(/-sub-indo.*/gim, '')
        .trim();
    },
    uiSelector(selector) {
      j.$('div.entry-meta')
        .first()
        .after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('li.episode-list');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('div > a')
            .first()
            .attr('href'),
          moeclip.domain,
        );
      },
      elementEp(selector) {
        return Number(
          selector
            .find('div > a')
            .first()
            .text()
            .replace(/\D+/, ''),
        );
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (
        page.url.split('/')[3] === 'anime' ||
        (j.$('div.video-content')[0] &&
          j.$('h1.entry-title.title-font')[0] &&
          j.$('#plv > div.contentsembed > div.episode-nav > div > div.eps-nav.pilih')[0])
      ) {
        page.handlePage();
      }
    });
  },
};
