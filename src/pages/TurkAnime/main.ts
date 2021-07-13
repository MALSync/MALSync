import { pageInterface } from '../pageInterface';

export const TurkAnime: pageInterface = {
  name: 'TurkAnime',
  domain: 'https://www.turkanime.net',
  languages: ['Turkish'],
  type: 'anime',
  isSyncPage(url) {
    return url.split('/')[3] === 'video';
  },
  sync: {
    getTitle() {
      return j
        .$('.breadcrumb a')
        .first()
        .text()
        .trim();
    },
    getIdentifier(url) {
      return TurkAnime.overview!.getIdentifier(TurkAnime.sync.getOverviewUrl(url));
    },
    getOverviewUrl() {
      return utils.absoluteLink(
        j
          .$('.breadcrumb a')
          .first()
          .attr('href'),
        TurkAnime.domain,
      );
    },
    getEpisode(episodeURL: string) {
      // Some translations:
      // "bolum" = "episode"
      // "bolum-final" = "final/last episode"

      // Valid inputs:
      // https://www.turkanime.net/video/shingeki-no-kyojin-24-bolum
      // https://www.turkanime.net/video/shingeki-no-kyojin-25-bolum-final

      // Invalid inputs
      // https://www.turkanime.net/video/shingeki-no-kyojin-ova-3-bolum
      // https://www.turkanime.net/video/shingeki-no-kyojin-ova-5-bolum-part-2-pismanlik-yok

      const animeNameSlug = TurkAnime.overview!.getIdentifier(
        TurkAnime.isSyncPage(window.location.href) //
          ? TurkAnime.sync.getOverviewUrl('')
          : window.location.href,
      );
      // Expected output: shingeki-no-kyojin

      const animeNameWithEpisodeSlug = TurkAnime.overview!.getIdentifier(episodeURL);

      const episodeSlug = animeNameWithEpisodeSlug.replace(`${animeNameSlug}-`, '');
      // Expected valid output: "24-bolum" | "25-bolum-final"
      // Expected invalid output: "ova-3-bolum" | "5-bolum-part-2-pismanlik-yok"

      const episodeNumberMatches = episodeSlug.match(
        // https://regex101.com/r/1DEx05/1
        /^(?<episodeNumber>\d+)-bolum(?:-final)?$/i,
      );

      if (!episodeNumberMatches?.groups) return NaN;

      return Number(episodeNumberMatches.groups.episodeNumber);
    },
    nextEpUrl() {
      const href = j.$("div.panel-footer a[href^='video']:nth-child(2)").attr('href');
      if (href) return utils.absoluteLink(href, TurkAnime.domain);
      return '';
    },
  },
  overview: {
    getTitle() {
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

        return utils.absoluteLink(anchorHref.replace(/^\/\//, 'https://'), TurkAnime.domain);
      },
      elementEp(selector) {
        const episodeURL = TurkAnime.overview!.list!.elementUrl(selector);

        return TurkAnime.sync.getEpisode(episodeURL);
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

    j.$(() => {
      utils.waitUntilTrue(
        () => document.querySelector('.list.menum'),
        () => page.handlePage(),
      );
    });
  },
};
