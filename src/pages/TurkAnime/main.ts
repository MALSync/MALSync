import { SITE_DOMAINS } from '../../config/siteDomains';
/* cspell:ignore videobaslik */
import { pageInterface } from '../pageInterface';
import type { SyncPage } from '../syncPage';

function removeTurkishPhrases(title: string) {
  return title.replace(/(?: |-)[İi]zle.*/i, '');
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const TurkAnime: pageInterface = {
  name: 'TurkAnime',
  domain: `${SITE_DOMAINS.turkAnime.main}/`,
  languages: ['Turkish'],
  type: 'anime',
  isSyncPage(url: string) {
    return /\/video\//.test(url);
  },
  sync: {
    getTitle: () => {
      const titleElement = document.querySelector('.videobaslik h1') as HTMLHeadElement;

      if (!titleElement) {
        throw Error("Can't find title element");
      }

      const title = titleElement.innerText;

      return removeTurkishPhrases(title);
    },
    getOverviewUrl: () => {
      const overviewAnchor = document.querySelector(
        '.videobaslik .btn-group a:first-child',
      ) as HTMLAnchorElement;

      if (!overviewAnchor) {
        throw Error("Can't find overview anchor element");
      }

      return overviewAnchor.href;
    },
    getIdentifier: () => {
      const overviewUrl = TurkAnime.sync.getOverviewUrl('');
      const identifier = TurkAnime.overview && TurkAnime.overview.getIdentifier(overviewUrl);

      if (!identifier) {
        throw Error("Can't find identifier");
      }

      return identifier;
    },
    getEpisode: (url: string) => {
      if (!url) return NaN;

      const path = url.split('/').pop();
      if (!path) return NaN;

      const match = path.match(/.*-(\d+)-.*/);
      return Number(match ? match[1] : undefined);
    },
    nextEpUrl: () => {
      const nextEpisodeAnchor = document.querySelector(
        '.videobaslik .btn-group a:last-child',
      ) as HTMLAnchorElement;

      if (!nextEpisodeAnchor) {
        throw Error("Can't find next episode anchor element");
      }

      if (!nextEpisodeAnchor.href.includes('video')) return undefined;

      return nextEpisodeAnchor.href;
    },
  },
  overview: {
    getTitle: () => {
      const titleElement = document.querySelector('.videobaslik h1') as HTMLHeadElement;

      if (!titleElement) {
        throw Error("Can't find title element");
      }

      return removeTurkishPhrases(titleElement.innerText);
    },
    uiSelector: html => {
      const statusBarContainerElement = document.querySelector('.animeDetail') as HTMLDivElement;

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
      elementsSelector: () => j.$('.list.menum li a'),
      elementUrl: ($element: JQuery<HTMLElement>) => {
        return $element.attr('href') || '';
      },
      elementEp: (episodeElement: JQuery<HTMLElement>) => {
        const text = episodeElement.text();
        const matches = text.match(/(\d+)\. Bölüm/) || [];

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
      utils.waitUntilTrue(
        () => document.querySelector('.list.menum'),
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        () => page.handlePage(),
      );
    });
  },
};
