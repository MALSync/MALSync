import { pageInterface } from '../pageInterface';

export const NekoSama: pageInterface = {
  name: 'NekoSama',
  domain: ['https://animecat.net', 'https://neko-sama.fr'],
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
      return j
        .$('#watch > div > div > h1')
        .text()
        .trim()
        .replace(/ (VOSTFR|VF)$/, '')
        .replace(/ \d+$/, '');
    },
    getIdentifier(url) {
      const urlPart5 = utils.urlPart(url, 5);

      if (!urlPart5) return '';

      const identifierMatches = urlPart5.match(/^\d*/);

      if (!identifierMatches || identifierMatches.length === 0) return '';

      return identifierMatches[0];
    },
    getOverviewUrl(url) {
      const subdub = utils.urlPart(url, 5).match(/(?:_vostfr|_vf)?$/);
      const endurl = utils.urlPart(url, 5).replace(/(-\d+)(_vostfr|_vf)?$/, '');

      return `${NekoSama.domain}/anime/info/${endurl}${subdub}`;
    },
    getEpisode(url) {
      const headerElementText = j.$('#watch > div > div > h1').text();

      if (!headerElementText) return NaN;

      return Number(
        headerElementText
          .trim()
          .replace(/ (VOSTFR|VF)$/, '')
          .match(/\d+$/),
      );
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
        return j.$('#stats > div > div.episodes > div.row > div');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.find('a').first().attr('href'), NekoSama.domain);
      },
      elementEp(selector) {
        return Number(selector.find('a').first().text().split('-').pop() || '');
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
