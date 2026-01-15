import { pageInterface } from '../pageInterface';

export const AnimeSama: pageInterface = {
  name: 'AnimeSama',
  domain: 'https://anime-sama.tv',
  languages: ['French'],
  type: 'anime',
  isSyncPage(url) {
    return Boolean($('#playerDF').length);
  },
  sync: {
    getTitle(_) {
      let titre = j.$('#titreOeuvre').text().trim();
      const saison = j.$('#avOeuvre').text().trim();
      const film = j.$('#selectEpisodes').val();
      if (saison === 'Film' && film) titre += ` ${saison} ${film}`;
      else if (saison !== 'Saison 1') titre += ` ${saison}`;
      return titre;
    },
    getIdentifier(url) {
      let identifier = utils.urlPart(url, 4) || '';
      if (
        identifier !== '' &&
        utils.urlPart(url, 5) &&
        utils.urlPart(url, 5).startsWith('saison')
      ) {
        identifier += `/${utils.urlPart(url, 5)}`;
      }
      return identifier;
    },
    getOverviewUrl(url) {
      return `${AnimeSama.domain}/catalogue/${utils.urlPart(url, 4)}`;
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
