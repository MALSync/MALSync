import { pageInterface } from '../pageInterface';

export const FRAnime: pageInterface = {
  name: 'FRAnime',
  domain: 'https://franime.fr',
  languages: ['French'],
  type: 'anime',
  isSyncPage(url) {
    return $('div#episode').length === 0;
  },
  isOverviewPage(url) {
    return Boolean($('div#episode').length);
  },
  sync: {
    getTitle(url) {
      const videoSchema = JSON.parse(
        $('div > script[type="application/ld+json"]:contains("VideoObject")').first().text(),
      );
      const parsedUrl = new URL(url);
      const season = parsedUrl.searchParams.get('s');

      if (season && parseInt(season) !== 1) return `${videoSchema.name} Season ${season}`;

      return videoSchema.name;
    },
    getIdentifier(url) {
      return `${FRAnime.sync.getTitle(url).toLowerCase().split(' ').join('-')}`;
    },
    getOverviewUrl(url) {
      const parsedUrl = new URL(url);
      parsedUrl.searchParams.set('ep', '');
      return parsedUrl.toString();
    },
    getEpisode(url) {
      const parsedUrl = new URL(url);
      const episode = parsedUrl.searchParams.get('ep');
      if (!episode) return 1;
      return Number(episode);
    },
  },
  overview: {
    getTitle(url) {
      return FRAnime.sync.getTitle(url);
    },
    getIdentifier(url) {
      const parsedUrl = new URL(url);
      const season = parsedUrl.searchParams.get('s');
      return `${FRAnime.overview!.getTitle(url).toLowerCase().split(' ').join('-')}${
        season ? `-s${season}` : ''
      }`;
    },
    uiSelector(selector) {
      j.$('#episode').parent().before(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('#episode').parent().next('div').find('a');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), FRAnime.domain);
      },
      elementEp(selector) {
        return FRAnime.sync.getEpisode(
          utils.absoluteLink(selector.attr('href'), FRAnime.domain) || '',
        );
      },
    },
  },
  init(page) {
    const handlePage = () => {
      api.storage.addStyle(
        require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
      );
      page.handlePage();
      utils.urlChangeDetect(() => {
        page.reset();
        page.handlePage();
      });
    };
    utils.waitUntilTrue(
      () =>
        Boolean(j.$('#root')) &&
        (Boolean(j.$('#episode')) || Boolean(j.$('h1').next('div').find('select').length)) &&
        Boolean($('div > script[type="application/ld+json"]:contains("VideoObject")').first()),
      handlePage,
      1000,
    );
  },
};
