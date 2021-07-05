import { pageInterface } from '../pageInterface';

export const KickAssAnime: pageInterface = {
  name: 'KickAssAnime',
  domain: 'https://www.kickassanime.ro',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    if (typeof url.split('/')[5] === 'undefined') {
      return false;
    }
    return true;
  },
  sync: {
    getTitle(url) {
      return utils.getBaseText($('#animeInfoTab > a'));
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    getOverviewUrl(url) {
      return `${KickAssAnime.domain}/anime/${KickAssAnime.sync.getIdentifier(url)}`;
    },
    getEpisode(url) {
      const urlParts = url.split('/');

      if (!urlParts || urlParts.length === 0) return NaN;

      const episodePart = urlParts[5];

      if (episodePart.length === 0) return NaN;

      const temp = episodePart.match(/episode-\d*/gi);

      if (!temp || temp.length === 0) return NaN;

      return Number(temp[0].replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      const href = j.$("#sidebar-anime-info > div > div > a:contains('Next Episode')").attr('href');
      if (href) return utils.absoluteLink(href, KickAssAnime.domain);
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return j.$('h1.title').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('div.anime-info')
        .first()
        .after(
          j.html(`<div class="border rounded mb-2 p-3"><div class="font-weight-bold">MAL-Sync</div>${selector}</div`),
        );
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div.anime-list tbody > tr');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.find('a').attr('href'), KickAssAnime.domain);
      },
      elementEp(selector) {
        const text = selector.find('a').text();
        if (!text.toLowerCase().includes('episode')) return NaN;
        return Number(text.replace(/\D+/g, ''));
      },
      paginationNext(updateCheck) {
        con.log('updatecheck', updateCheck);
        const el = j.$(' div.main-episode-list > div > div > div > button:nth-child(2):enabled');
        if (typeof el[0] === 'undefined') {
          return false;
        }
        el[0].click();
        return true;
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (page.url.split('/')[3] === 'anime') {
        utils.waitUntilTrue(
          function() {
            return KickAssAnime.sync.getTitle(page.url) || KickAssAnime.overview!.getTitle(page.url);
          },
          function() {
            page.handlePage();
          },
        );
      }
    });
  },
};
