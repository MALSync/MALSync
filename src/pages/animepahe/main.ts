/* By Deterio */
import { pageInterface } from '../pageInterface';

export const animepahe: pageInterface = {
  name: 'animepahe',
  domain: 'https://animepahe.com',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    if (window.location.href.split('/')[3] !== 'play') {
      return false;
    }
    return true;
  },
  sync: {
    getTitle(url) {
      return j.$('.theatre-info h1 a').first().text().trim();
    },
    getIdentifier(url) {
      return getId()!;
    },
    getOverviewUrl(url) {
      return `${window.location.origin}/a/${getId()}`;
    },
    getEpisode(url) {
      return Number(
        (j.$('.theatre-info h1')[0].childNodes[2].textContent || '').replace(/[^0-9.]+/g, ''),
      );
    },
    nextEpUrl(url) {
      const nextEp = j.$('.sequel a').first().attr('href');
      if (!nextEp) return '';
      return utils.absoluteLink(nextEp, window.location.origin);
    },
    uiSelector(selector) {
      j.$('.anime-season').after(j.html(selector));
    },
    getMalUrl(provider) {
      return animepahe.overview!.getMalUrl!(provider);
    },
  },
  overview: {
    getTitle(url) {
      return j.$('.title-wrapper h1 > span').first().text().trim();
    },
    getIdentifier(url) {
      return getId()!;
    },
    uiSelector(selector) {
      j.$('.anime-content').prepend(j.html(selector));
    },
    getMalUrl(provider) {
      const mal = $('meta[name=myanimelist]').attr('content');
      if (mal) return `https://myanimelist.net/anime/${mal}`;
      if (provider === 'ANILIST') {
        const al = $('meta[name=anilist]').attr('content');
        if (al) return `https://anilist.co/anime/${al}`;
      }
      if (provider === 'KITSU') {
        const kitsu = $('meta[name=kitsu]').attr('content');
        if (kitsu) return `https://kitsu.app/anime/${kitsu}`;
      }
      return false;
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.episode-list .episode');
      },
      elementUrl(selector) {
        const anchor = selector.find('a').first();

        if (!anchor) return '';

        const path = anchor.attr('href');

        if (!path) return '';

        return animepahe.domain + path;
      },
      elementEp(selector) {
        return Number(
          selector
            .find('.episode-number')
            .first()
            .text()
            .replace(selector.find('.episode-number > *').text(), ''),
        );
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    utils.waitUntilTrue(
      function () {
        if (!animepahe.isSyncPage(window.location.href))
          return animepahe.overview!.list!.elementsSelector!() && typeof getId() !== 'undefined';
        return typeof getId() !== 'undefined';
      },
      function () {
        page.handlePage();
      },
    );
  },
};

function getId() {
  const id = j.$('meta[name=id]').attr('content');
  if (id) return id;
  return undefined;
}
