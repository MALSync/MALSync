import { pageInterface } from '../pageInterface';

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
    getOverviewUrl(url) {
      return utils.absoluteLink(
        j
          .$('.breadcrumb a')
          .first()
          .attr('href'),
        Turkanime.domain,
      );
    },
    getEpisode(url) {
      return getEpisode(Turkanime.sync.getIdentifier(url), Turkanime.overview!.getIdentifier(url));
    },
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
        const url = Turkanime.overview!.list!.elementUrl(selector);
        return getEpisode(
          Turkanime.overview!.getIdentifier(window.location.href),
          Turkanime.overview!.getIdentifier(url),
        );
        return Turkanime.sync!.getEpisode(Turkanime.overview!.list!.elementUrl(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (Turkanime.isSyncPage(page.url)) {
        page.handlePage();
      } else {
        utils.waitUntilTrue(
          function() {
            return j.$('.list.menum').length;
          },
          function() {
            page.handlePage();
          },
        );
      }
    });
  },
};

function getEpisode(selector, episodeSelector) {
  const diff = episodeSelector.replace(selector, '').replace(/-/g, ':');
  con.log('getEpisode', selector, episodeSelector, diff);
  const temp = diff.match(/\d+/);
  if (temp === null) {
    return 0;
  }
  return parseInt(temp[0]);
}
