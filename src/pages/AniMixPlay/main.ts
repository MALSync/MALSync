import { pageInterface } from '../pageInterface';

export const AniMixPlay: pageInterface = {
  name: 'AniMixPlay',
  domain: 'https://animixplay.to',
  database: 'AniMixPlay',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3].startsWith('v')) {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    if (url.split('/')[3] === 'anime') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('span.animetitle').text();
    },
    getIdentifier(url) {
      if (hasMalOverview()) {
        return j
          .$('#animebtn')!
          .attr('href')!
          .split('/')[2];
      }
      return `nomal_${utils.urlPart(url, 4)}`;
    },
    getOverviewUrl(url) {
      if (hasMalOverview()) {
        return `${AniMixPlay.domain}/anime/${AniMixPlay.sync.getIdentifier(url)}`;
      }
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
      if (!hasMalOverview()) {
        j.$('button#followbtn')
          .first()
          .after(j.html(selector));
      }
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
      return j.$('#animepagetitle').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('#animepagetitle').after(j.html(`${selector}`));
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
        return Number(selector.text().replace(/\D+/g, ''));
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

    let interval;

    utils.fullUrlChangeDetect(function() {
      page.reset();
      check();
    }, true);

    function check() {
      clearInterval(interval);
      interval = utils.waitUntilTrue(
        function() {
          return AniMixPlay.sync.getEpisode(page.url) || AniMixPlay.isOverviewPage!(window.location.href);
        },
        function() {
          page.handlePage();
        },
      );
    }
  },
};

function hasMalOverview() {
  return j.$('#animebtn[href]').length > 0;
}
