import { pageInterface } from '../pageInterface';

function GetOverviewAnchor() {
  const anchor = document.querySelector(`a[href^="/anime"]`) as HTMLAnchorElement;

  if (!anchor) {
    throw Error("Can't find overview anchor element");
  }

  return anchor;
}

function RemoveTurkishPhrases(title: string) {
  // "izle" or "İzle" is the translation of the word "watch" or "Watch"
  // Regexp can be test it out in here https://regex101.com/r/gULQnv/1
  return title.replace(/(?: |-)[İi]zle.*/i, '');
}

function IsOverviewUrl(url: string) {
  return /\/anime\//.test(url);
}

// Example urls
// overview page url: https://www.tranimeizle.net/anime/one-punch-man-izle-hd
// sync page url: https://www.tranimeizle.net/one-punch-man-1-bolum-izle

export const TRanimeizle: pageInterface = {
  name: 'TRanimeizle',
  domain: 'https://www.tranimeizle.net/',
  languages: ['Turkish'],
  type: 'anime',
  isSyncPage(_url: string) {
    const url = new URL(_url);
    const [, path] = url.pathname.split('/');

    // "bolum" is the translation of the word "episode"
    return path?.toLowerCase().includes('-bolum-');
  },
  sync: {
    getTitle: () => {
      const overviewAnchor = GetOverviewAnchor();

      return RemoveTurkishPhrases(overviewAnchor.innerText);
    },
    getOverviewUrl: () => {
      const overviewAnchor = GetOverviewAnchor();

      return overviewAnchor.href;
    },
    getIdentifier: () => {
      const overviewUrl = TRanimeizle.sync.getOverviewUrl('');
      const identifier = TRanimeizle.overview?.getIdentifier(overviewUrl);

      if (!identifier) {
        throw Error("Can't find identifier");
      }

      return identifier;
    },
    getEpisode: (url: string) => {
      if (!url) return NaN;

      // plunderer-18-bolum-izle -> "18" is the episode number
      // ghost-22-1-bolum-izle -> "1" is the episode number
      // regexp will return the episode number in group 1
      // Regexp can be test it out in here https://regex101.com/r/VrbOgK/1
      return Number(url.replace(/.*-(\d{1,})-.*/, '$1') || undefined);
    },
    nextEpUrl: () => {
      const nextEpisodeAnchor = document.querySelector(
        `.youtube-wrapper .my-15 a:first-child`,
      ) as HTMLAnchorElement;

      if (!nextEpisodeAnchor) {
        throw Error("Can't find next episode anchor element");
      }

      if (!nextEpisodeAnchor.href.includes('izle') || !nextEpisodeAnchor.href.includes('bolum'))
        return undefined;

      return nextEpisodeAnchor.href;
    },
  },
  overview: {
    getTitle: () => {
      const titleElement = document.querySelector('.playlist-title > h1') as HTMLHeadElement;

      if (!titleElement) {
        throw Error("Can't find title element");
      }

      return RemoveTurkishPhrases(titleElement.innerText);
    },
    uiSelector: HTML => {
      const statusBarContainerElement = document.querySelector('div.animeDetail') as HTMLDivElement;

      if (!statusBarContainerElement) {
        throw Error("Can't find the element where the status bar will be placed");
      }

      const wrapper = document.createElement('div');

      // No need satisfy the rule on this line because wrapper will have escaped HTML content
      // eslint-disable-next-line jquery-unsafe-malsync/no-xss-jquery
      statusBarContainerElement.prepend(wrapper);

      wrapper.insertAdjacentHTML('beforebegin', j.html(HTML));
    },
    getIdentifier: (url: string) => {
      const identifier = utils.urlPart(url, 4);

      if (!identifier) return '';

      return identifier;
    },
    list: {
      offsetHandler: false,
      elementsSelector: () => j.$('.animeDetail-playlist > .animeDetail-items > ol > li'),
      elementUrl: ($element: JQuery<HTMLElement>) => {
        // episodeSlug: plunderer-1-bolum-izle
        const episodeSlug: string = $element.data('slug');

        if (!episodeSlug) {
          throw Error('Unable to get slug from element');
        }

        return `${TRanimeizle.domain}/${episodeSlug}`;
      },
      elementEp: (episodeElement: JQuery<HTMLElement>) => {
        const slug = episodeElement.children().first().attr('href');

        if (!slug) {
          throw Error('Unable to get slug');
        }

        // https://regex101.com/r/KlUgJd/1
        const matches = slug.match(/.*?-(\d{1,})-bolum-izle/) || [];

        if (!matches) {
          throw Error('Unable to find episode number');
        }

        return Number(matches[1]);
      },
    },
  },
  init(page) {
    // eslint-disable-next-line import/no-unresolved, global-require
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    j.$(() => {
      if (!TRanimeizle.isSyncPage(page.url) && !IsOverviewUrl(page.url)) return;

      page.handlePage();
    });
  },
};
