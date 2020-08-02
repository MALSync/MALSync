import { pageInterface } from '../pageInterface';

export const AniMixPlay: pageInterface = {
  name: 'AniMixPlay',
  domain: 'https://animixplay.com',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    return true;
  },
  sync: {
    getTitle(url) {
      return j.$('span.animetitle').text();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    getOverviewUrl(url) {
      return url.replace(/ep\d+$/i, '').replace(/\/$/, '');
    },
    getEpisode(url) {
      return Number(
        j
          .$('#epslistplace > button:disabled')
          .last()
          .text()
          .replace(/\D+/g, ''),
      );
    },
    uiSelector(selector) {
      j.$('span.animetitle')
        .first()
        .after(j.html(selector));
    },
    nextEpUrl(url) {
      const nextEpisodeButton = j
        .$('#epslistplace > button:disabled')
        .last()
        .next();
      if (nextEpisodeButton && nextEpisodeButton.length) {
        return AniMixPlay.overview!.list!.elementUrl(nextEpisodeButton);
      }
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return '';
    },
    getIdentifier(url) {
      return '';
    },
    uiSelector(selector) {
      // no Ui
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('#epslistplace > button');
      },
      elementUrl(selector) {
        const regex = /\/ep\d+$/;
        const episode = selector.text().replace(/\D+/g, '');
        const url = window.location.href;

        if (regex.test(url)) {
          return url.replace(regex, `/ep${episode}`);
        }
        return `${url}/ep${episode}`;
      },
      elementEp(selector) {
        return selector.text().replace(/\D+/g, '');
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

    let interval;

    utils.fullUrlChangeDetect(function() {
      page.reset();
      check();
    });

    function check() {
      clearInterval(interval);
      interval = utils.waitUntilTrue(
        function() {
          return AniMixPlay.sync.getEpisode(page.url);
        },
        function() {
          page.handlePage();
        },
      );
    }
  },
};
