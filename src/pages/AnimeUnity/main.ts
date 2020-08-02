import { pageInterface } from '../pageInterface';

export const AnimeUnity: pageInterface = {
  name: 'AnimeUnity',
  domain: 'https://animeunity.it',
  languages: ['Italian'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[4] !== undefined && url.split('/')[4].length) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$('div.general > h1.title')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return `${AnimeUnity.domain}/anime/${AnimeUnity.sync.getIdentifier(url)}`;
    },
    getEpisode(url) {
      const episode = Number(
        j
          .$('div.episode-wrapper > div.episode.episode-item.active')
          .text()
          .trim(),
      );
      if (episode) return episode;
      return 1;
    },
    uiSelector(selector) {
      j.$('div.general > h1.title').after(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    utils.fullUrlChangeDetect(function() {
      page.reset();
      page.handlePage();
    });
  },
};
