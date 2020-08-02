import { pageInterface } from '../pageInterface';

export const Kissanime: pageInterface = {
  name: 'kissanime',
  domain: 'https://kissanime.ru',
  database: 'Kissanime',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    if (utils.urlPart(url, 5)) {
      if (j.$('#centerDivVideo').length) {
        return true;
      }
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$('#navsubbar a')
        .first()
        .text()
        .replace('Anime', '')
        .replace('information', '')
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return url
        .split('/')
        .slice(0, 5)
        .join('/');
    },
    getEpisode(url) {
      const episodePart = utils.urlPart(url, 5).replace(/1080p|720p/i, ' ');

      const episodeTextMatches = episodePart.match(/[e,E][p,P][i,I]?[s,S]?[o,O]?[d,D]?[e,E]?\D?\d+/);

      if (!episodeTextMatches || episodeTextMatches.length === 0) return NaN;

      const [episodeText] = episodeTextMatches;

      const episodeNumberMatches = episodeText.match(/\d+($|-)/m);

      if (!episodeNumberMatches || episodeNumberMatches.length === 0) return NaN;

      const [episodeNumber] = episodeNumberMatches;

      return Number(episodeNumber.replace(/[^\d]/g, ''));
    },
    nextEpUrl(url) {
      const nextEp = j
        .$('#selectEpisode option:selected')
        .next()
        .val();

      if (!nextEp) return '';

      return `${url.replace(/\/[^/]*$/, '')}/${nextEp}`;
    },
  },
  overview: {
    getTitle() {
      return j
        .$('.bigChar')
        .first()
        .text();
    },
    getIdentifier(url) {
      return Kissanime.sync.getIdentifier(url);
    },
    uiSelector(selector) {
      j.$('.bigChar')
        .first()
        .after(j.html(selector));
    },
    list: {
      offsetHandler: true,
      elementsSelector() {
        return j.$('.listing tr');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('a')
            .first()
            .attr('href'),
          Kissanime.domain,
        );
      },
      elementEp(selector) {
        const url = Kissanime.overview!.list!.elementUrl(selector);
        if (
          /_ED|_OP|_Ending|_Opening|_Preview|_Trailer/i.test(
            selector
              .find('a')
              .first()
              .text(),
          )
        )
          return NaN;
        return Kissanime.sync.getEpisode(url);
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      page.handlePage();
    });
  },
};
