import { SITE_DOMAINS } from '../../config/siteDomains';
import { pageInterface } from '../pageInterface';
import type { SyncPage } from '../syncPage';

function getOverviewAnchor() {
  const anchor = document.querySelector('a[href^="/anime"]') as HTMLAnchorElement;

  if (!anchor) {
    throw Error("Can't find overview anchor element");
  }

  return anchor;
}

function removeTurkishPhrases(title: string) {
  // "izle" or "İzle" is the translation of the word "watch" or "Watch"
  // Regexp can be test it out in here https://regex101.com/r/gULQnv/1
  return title.replace(/(?: |-)[İi]zle.*/i, '');
}

function isOverviewUrl(url: string) {
  return /\/anime\//.test(url);
}

// Example urls
// overview page url: https://www.tranimeizle.net/anime/one-punch-man-izle-hd
// sync page url: https://www.tranimeizle.net/one-punch-man-1-bolum-izle

// eslint-disable-next-line @typescript-eslint/naming-convention
export const TRanimeizle: pageInterface = {
  name: 'TRanimeizle',
  domain: `${SITE_DOMAINS.trAnimeizle.main}/`,
  languages: ['Turkish'],
  type: 'anime',
  isSyncPage(_url: string) {
    const url = new URL(_url);
    const [, path] = url.pathname.split('/');

    // "bolum" is the translation of the word "episode"
    return !!(path && path.toLowerCase().includes('-bolum-'));
  },
  sync: {
    getTitle: () => {
      const overviewAnchor = getOverviewAnchor();

      return removeTurkishPhrases(overviewAnchor.innerText);
    },
    getOverviewUrl: () => {
      const overviewAnchor = getOverviewAnchor();

      return overviewAnchor.href;
    },
    getIdentifier: () => {
      const overviewUrl = TRanimeizle.sync.getOverviewUrl('');
      const identifier = TRanimeizle.overview && TRanimeizle.overview.getIdentifier(overviewUrl);

      if (!identifier) {
        throw Error("Can't find identifier");
      }

      return identifier;
    },
    getEpisode: (url: string) => {
      if (!url) return NaN;

      // plunderer-18-bolum-izle -> "18" is the episode number
      const match = url.match(/.*-(\d{1,})-.*/);
      return Number(match ? match[1] : undefined);
    },
    nextEpUrl: () => {
      const nextEpisodeAnchor = document.querySelector(
        '.youtube-wrapper .my-15 a:first-child',
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

      return removeTurkishPhrases(titleElement.innerText);
    },
    uiSelector: html => {
      const statusBarContainerElement = document.querySelector('div.animeDetail') as HTMLDivElement;

      if (!statusBarContainerElement) {
        throw Error("Can't find the element where the status bar will be placed");
      }

      j.$(statusBarContainerElement).prepend(j.html(html));
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
        const href = $element.children().first().attr('href');

        if (!href) {
          throw Error('Unable to get href from element');
        }

        return utils.absoluteLink(href, TRanimeizle.domain as string) as string;
      },
      elementEp: (episodeElement: JQuery<HTMLElement>) => {
        const slug = episodeElement.children().first().attr('href');

        if (!slug) {
          throw Error('Unable to get slug');
        }

        const matches = slug.match(/.*?-(\d{1,})-bolum-izle/) || [];

        if (matches.length === 0) {
          throw Error('Unable to find episode number');
        }

        return Number(matches[1]);
      },
    },
  },
  init(page: SyncPage) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    api.storage.addStyle(
      // eslint-disable-next-line
      (require('!to-string-loader!css-loader!less-loader!./style.less') as any).toString(),
    );

    j.$(() => {
      const url = page.url as string;
      if (!TRanimeizle.isSyncPage(url) && !isOverviewUrl(url)) return;

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      page.handlePage();
    });
  },
};
