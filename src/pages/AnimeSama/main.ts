import { pageInterface } from '../pageInterface';

export const AnimeSama: pageInterface = {
  name: 'AnimeSama',
  domain: 'https://anime-sama.fr',
  languages: ['French'],
  type: 'anime',
  isSyncPage(url) {
    return Boolean($('#playerDF').length);
  },
  sync: {
    getTitle(_) {
      return j.$('#titreOeuvre').text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4) || '';
    },
    getOverviewUrl(url) {
      return `${AnimeSama.domain}/catalogue/${AnimeSama.sync.getIdentifier(url)}`;
    },
    getEpisode(_) {
      const temp = j
        .$('#selectEpisodes')
        .val()
        ?.toString()
        .match(/Episode (\d+)/i);
      if (!temp) return 1;
      return Number(temp[1]);
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    utils.changeDetect(
      () => {
        page.handlePage();
      },
      () => {
        return j.$('#selectEpisodes').val();
      },
    );

    utils.waitUntilTrue(
      () => this.isSyncPage(),
      () => page.handlePage(),
      1000,
    );
  },
};
