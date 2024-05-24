import { pageInterface } from '../pageInterface';

let jsonData = {
  page: '',
  slug: '',
  name: '',
  anilistID: null,
  malID: null,
  episode: null,
  'page-url': null,
  'next-episode-url': null,
};

export const Animeflix: pageInterface = {
  name: 'Animeflix',
  domain: 'https://animeflix.gg',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    return jsonData.page === 'episode';
  },
  isOverviewPage(url) {
    return jsonData.page === 'anime';
  },
  sync: {
    getTitle() {
      return jsonData.name;
    },
    getIdentifier(url) {
      return jsonData.slug;
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(jsonData['page-url'], Animeflix.domain);
    },
    nextEpUrl() {
      return utils.absoluteLink(jsonData['next-episode-url'], Animeflix.domain);
    },
    getEpisode() {
      return jsonData.episode || 0;
    },
    getMalUrl(provider) {
      return Animeflix.overview!.getMalUrl!(provider);
    },
  },
  overview: {
    getTitle() {
      return jsonData.name;
    },
    getIdentifier() {
      return jsonData.slug!;
    },
    uiSelector(selector) {
      j.$('#mal-sync').append(j.html(selector));
    },
    async getMalUrl(provider) {
      if (jsonData.malID) {
        return `https://myanimelist.net/anime/${jsonData.malID}`;
      }

      if (provider === 'ANILIST' && jsonData.anilistID) {
        return `https://anilist.co/anime/${jsonData.anilistID}`;
      }

      return false;
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('a[href^="/watch/"]');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), Animeflix.domain);
      },
      elementEp(selector) {
        const url = Animeflix.overview!.list!.elementUrl!(selector);
        const temp = url.match(/episode-(\d+)/i);
        if (!temp) return NaN;
        return Number(temp[1]);
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    let _debounce;
    let listUpdate: number;

    utils.changeDetect(check, () => j.$('#syncData').text());
    check();

    function check() {
      page.reset();
      clearInterval(listUpdate);
      if (j.$('#syncData').length) {
        jsonData = JSON.parse(j.$('#syncData').text());
        clearTimeout(_debounce);
        _debounce = setTimeout(() => {
          page.handlePage();
        }, 500);

        listUpdate = utils.changeDetect(
          () => page.handleList(),
          () =>
            Animeflix.overview!.list!.elementUrl!(
              Animeflix.overview!.list!.elementsSelector()!.first(),
            ) +
            Animeflix.overview!.list!.elementUrl!(
              Animeflix.overview!.list!.elementsSelector()!.last(),
            ),
        );
      }
    }
  },
};
