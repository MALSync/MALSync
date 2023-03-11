import { pageInterface } from '../pageInterface';

export const NekoSama: pageInterface = {
  name: 'NekoSama',
  domain: 'https://neko-sama.fr',
  languages: ['French'],
  type: 'anime',
  isSyncPage(url) {
    if (j.$('#watch').length) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('.details > div > h1 > a').text() || j.$('.details > div > h2 > a').text();
    },
    getIdentifier(url) {
      const urlPart5 = utils.urlPart(url, 5);

      if (!urlPart5) return '';

      const identifierMatches = urlPart5.match(/^\d*/);

      if (!identifierMatches || identifierMatches.length === 0) return '';

      return identifierMatches[0];
    },
    getOverviewUrl(url) {
      return (
        NekoSama.domain +
        (j.$('.details > div > h1 > a').attr('href') ||
          j.$('.details > div > h2 > a').attr('href') ||
          '')
      );
    },
    getEpisode(url) {
      const headerElementText = j
        .$('#watch > div > div.row.no-gutters.anime-info > div.info > div > div > h2')
        .text();

      if (!headerElementText) return NaN;

      return Number(headerElementText.split('Episode ').pop());
    },
    nextEpUrl(url) {
      return utils.absoluteLink(
        j
          .$(
            '#watch > div > div:nth-child(2) > div > div.item.right > a.ui.button.small.with-svg-right',
          )
          .attr('href'),
        NekoSama.domain,
      );
    },
  },

  overview: {
    getTitle(url) {
      return utils
        .getBaseText($('#head > div.content > div > div > div > h1'))
        .split(' VOSTFR')[0]
        .split(' VF')[0];
    },
    getIdentifier(url) {
      return NekoSama.sync.getIdentifier(url);
    },
    uiSelector(selector) {
      j.$('#head > div.content > div > div > div > div').first().after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$(
          '#stats > div > div.episodes > div.row.no-gutters.js-list-episode-container > div > div > div.text',
        );
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.find('a').first().attr('href'), NekoSama.domain);
      },
      elementEp(selector) {
        return Number(selector.find('a').first().find('span.episode').text().replace(/\D+/, ''));
      },
    },
  },

  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    utils.waitUntilTrue(
      function () {
        return j.$('#stats,#watch').length;
      },
      function () {
        page.handlePage();

        j.$('.ui.toggle.checkbox, #stats > div > div.episodes > div > div').click(function () {
          setTimeout(function () {
            page.handleList();
          }, 500);
        });
      },
    );
  },
};
