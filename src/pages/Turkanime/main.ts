import { pageInterface } from '../pageInterface';

function IsOverviewUrl(url: string) {
  return /\/anime\//.test(url);
}

// Some translations:
// "bolum" = "episode"
// "bolum-final" = "final/last episode"

// Valid inputs:
// https://www.turkanime.net/video/shingeki-no-kyojin-24-bolum
// https://www.turkanime.net/video/shingeki-no-kyojin-25-bolum-final

// Invalid inputs
// https://www.turkanime.net/video/shingeki-no-kyojin-ova-3-bolum
// https://www.turkanime.net/video/shingeki-no-kyojin-ova-5-bolum-part-2-pismanlik-yok
function extractEpisodeNumber(episodeURL: string): number {
  const animeNameSlug = Turkanime.overview!.getIdentifier(
    IsOverviewUrl(window.location.href) //
      ? window.location.href
      : Turkanime.sync.getOverviewUrl(''),
  );
  // Expected output: shingeki-no-kyojin

  const animeNameWithEpisodeSlug = Turkanime.overview!.getIdentifier(episodeURL);

  const episodeSlug = animeNameWithEpisodeSlug.replace(`${animeNameSlug}-`, '');
  // Expected valid output: "24-bolum" | "25-bolum-final"
  // Expected invalid output: "ova-3-bolum" | "5-bolum-part-2-pismanlik-yok"

  const episodeNumberMatches = episodeSlug.match(
    // https://regex101.com/r/yBcQgN/1
    /(?<!-)(?<episodeNumber>\d+)-bolum(?:-final)?/i,
  );

  if (!episodeNumberMatches?.groups) return NaN;

  return Number(episodeNumberMatches.groups.episodeNumber);
}

export const Turkanime: pageInterface = {
  name: 'Turkanime',
  domain: 'https://www.turkanime.net',
  languages: ['Turkish'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3] !== 'video') {
      return false;
    }
    return true;
  },
  sync: {
    getTitle(url) {
      return j
        .$('.breadcrumb a')
        .first()
        .text()
        .trim();
    },
    getIdentifier(url) {
      return Turkanime.overview!.getIdentifier(Turkanime.sync.getOverviewUrl(url));
    },
    getOverviewUrl() {
      return utils.absoluteLink(
        j
          .$('.breadcrumb a')
          .first()
          .attr('href'),
        Turkanime.domain,
      );
    },
    getEpisode: extractEpisodeNumber,
    nextEpUrl(url) {
      const href = j.$("div.panel-footer a[href^='video']:nth-child(2)").attr('href');
      if (href) return utils.absoluteLink(href, Turkanime.domain);
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('#detayPaylas .panel-title')
        .first()
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4) || '';
    },
    uiSelector(selector) {
      j.$('#detayPaylas .panel-body')
        .first()
        .prepend(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.list.menum > li');
      },
      elementUrl(selector) {
        const anchorHref = selector
          .find('a')
          .last()
          .attr('href');

        if (!anchorHref) return '';

        return utils.absoluteLink(anchorHref.replace(/^\/\//, 'https://'), Turkanime.domain);
      },
      elementEp(selector) {
        const episodeURL = Turkanime.overview!.list!.elementUrl(selector);

        return extractEpisodeNumber(episodeURL);
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

    if (!Turkanime.isSyncPage(page.url) && !IsOverviewUrl(page.url)) return;

    j.$(() => {
      utils.waitUntilTrue(
        () => document.querySelector('.list.menum'),
        () => page.handlePage(),
      );
    });
  },
};
