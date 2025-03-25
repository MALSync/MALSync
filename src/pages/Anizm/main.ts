import type { pageInterface } from '../pageInterface';

// Example urls
// overview page url: https://anizm.net/ore-dake-level-up-na-ken-season-2-arise-from-the-shadow
// sync page url: https://anizm.net/ore-dake-level-up-na-ken-season-2-arise-from-the-shadow-12-bolum
// sync page url: https://anizm.net/ore-dake-level-up-na-ken-season-2-arise-from-the-shadow-12-bolum-izle

export const Anizm: pageInterface = {
  name: 'Anizm',
  domain: 'https://anizm.net/',
  languages: ['Turkish'],
  type: 'anime',
  isSyncPage: () =>
    Boolean(document.querySelector('.episodeInfoContainer .animeIzleInnerContainer')),
  isOverviewPage: () =>
    Boolean(document.querySelector('.animeDetayInnerContainer .animeDetayInfoWrapper')),
  sync: {
    getTitle: () => {
      const overviewAnchor = document.querySelector<HTMLDivElement>(
        '.episodeContainer .info_otherTitle',
      );

      if (!overviewAnchor) {
        throw Error("Can't find the title");
      }

      return overviewAnchor.innerText;
    },
    getOverviewUrl: () => {
      const anchor = document.querySelector<HTMLAnchorElement>(
        '.animeIzleBolumListesi a.animeDetayKutuLink',
      );

      if (!anchor) {
        throw Error("Can't find overview anchor element");
      }

      return anchor.href;
    },
    getIdentifier: () => {
      const overviewUrl = Anizm.sync.getOverviewUrl('');
      const identifier = Anizm.overview?.getIdentifier(overviewUrl);

      if (!identifier) {
        throw Error("Can't find identifier");
      }

      return identifier;
    },
    getEpisode: url => {
      if (!url) return NaN;

      // plunderer-18-bolum -> "18" is the episode number
      // ghost-22-1-bolum -> "1" is the episode number
      // regexp will return the episode number in group 1
      // Regexp can be test it out in here https://regex101.com/r/VrbOgK/1
      return Number(url.replace(/.*-(\d{1,})-.*/, '$1') || undefined);
    },
    nextEpUrl: () => {
      const nextEpisodeAnchor = document.querySelector<HTMLAnchorElement>(
        '.anizm_alignRight a.anizm_button.default',
      );

      if (!nextEpisodeAnchor) return undefined;

      return nextEpisodeAnchor.href;
    },
  },
  overview: {
    getTitle: () => {
      const titleElement = document.querySelector<HTMLAnchorElement>('.anizm_pageTitle a');

      if (!titleElement) {
        throw Error("Can't find title element");
      }

      return titleElement.innerText;
    },
    uiSelector: html => {
      const statusBarContainerElement = document.querySelector<HTMLDivElement>(
        '.infoExtraData ul.dataRows',
      );

      if (!statusBarContainerElement) {
        throw Error("Can't find the element where the status bar will be placed");
      }

      const wrapper = document.createElement('li');

      wrapper.innerHTML = j.html(html);

      // eslint-disable-next-line jquery-unsafe-malsync/no-xss-jquery
      statusBarContainerElement.append(wrapper);
    },
    getIdentifier: url => {
      const identifier = utils.urlPart(url, 3);

      if (!identifier) return '';

      return identifier;
    },
    list: {
      offsetHandler: false,
      elementsSelector: () =>
        j.$('.episodeListTabContent .bolumKutucugu, .animeEpisodesLongList > a'),
      elementUrl: $element => {
        const episodeAnchor = (Anizm.isSyncPage('') ? $element : $element.children().first()).get(
          0,
        );

        if (!(episodeAnchor instanceof HTMLAnchorElement)) {
          throw Error('Unable to locate episode anchor');
        }

        return episodeAnchor.href;
      },
      elementEp: episodeElement => {
        const slug = utils.urlPart(Anizm.overview?.list?.elementUrl?.(episodeElement) || '', 3);

        if (!slug) {
          throw Error('Unable to get the slug');
        }

        // https://regex101.com/r/MtBz4J/2
        const [, episode] = slug.match(/.*?-(\d{1,})-bolum(?:-izle)?/) || [];

        if (!episode) {
          throw Error('Unable to find episode number');
        }

        return Number(episode);
      },
    },
  },
  init(page) {
    // eslint-disable-next-line import/no-unresolved, global-require
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    j.$(() => {
      if (!Anizm.isSyncPage(page.url) && !Anizm.isOverviewPage?.(page.url)) return;

      page.handlePage();
    });
  },
};
