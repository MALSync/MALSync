import { pageInterface } from '../pageInterface';

export const OgladajAnime: pageInterface = {
  name: 'OgladajAnime',
  domain: 'https://ogladajanime.pl',
  languages: ['Polish'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3] === 'anime') return true;
    return false;
  },
  isOverviewPage(url) {
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('#anime_name_id').text();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    getOverviewUrl(url) {
      return url.split('/').length === 6 ? url.split('/').slice(0, -1).join('/') : url;
    },
    getEpisode(url) {
      if (url.split('/')[5] !== undefined) return parseInt(url.split('/')[5]);
      return parseInt(j.$('ul > li.active').first().attr('value')!);
    },
    nextEpUrl(url) {
      const onclick = j.$('#next_ep_button').attr('onclick');
      if (onclick) {
        const nextep = onclick.split(', ')[1];
        return `${OgladajAnime.sync.getOverviewUrl(url)}/${nextep}`;
      }
      return '';
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(() => {
      page.handlePage();
      utils.urlChangeDetect(function () {
        utils.waitUntilTrue(
          function () {
            return j.$('ul > li.active').length;
          },
          function () {
            page.handlePage();
          },
        );
      });
    });
  },
};
