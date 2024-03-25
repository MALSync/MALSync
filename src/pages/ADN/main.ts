import { pageInterface } from '../pageInterface';

export const ADN: pageInterface = {
  name: 'ADN',
  domain: 'https://animationdigitalnetwork.fr',
  languages: ['French', 'German'],
  type: 'anime',
  isSyncPage(url) {
    return utils.urlPart(url, 3) === 'video' && Boolean(utils.urlPart(url, 5));
  },
  isOverviewPage(url) {
    return utils.urlPart(url, 3) === 'video' && !utils.urlPart(url, 5);
  },
  sync: {
    getTitle(url) {
      return j.$('div[data-testid="player-content"] h1 a').text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4) || '';
    },
    getOverviewUrl(url) {
      return `${ADN.domain}/video/${ADN.sync.getIdentifier(url)}`;
    },
    getEpisode(url) {
      return getEpisode(url);
    },
  },
  overview: {
    getTitle(url) {
      return $('div[data-testid="default-layout"] h1').first().text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4) || '';
    },
    uiSelector(selector) {
      j.$('div[data-testid="default-layout"] h2').first().before(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('[data-testid="default-layout"] ul li a[href^="/video/"][title]');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), ADN.domain);
      },
      elementEp(selector) {
        return getEpisode(selector.attr('href') || '', true);
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    ADN.domain = window.location.origin;

    let listInterval = 0;

    utils.fullUrlChangeDetect(() => {
      page.reset();
      if (ADN.isSyncPage(window.location.href)) {
        utils.waitUntilTrue(
          () => j.$('div[data-testid="video-player"]').length,
          () => page.handlePage(),
        );
      } else if (ADN.isOverviewPage!(window.location.href)) {
        utils.waitUntilTrue(
          () => ADN.overview!.getTitle(window.location.href).length,
          () => page.handlePage(),
        );

        clearInterval(listInterval);
        listInterval = utils.changeDetect(
          () => {
            setTimeout(() => page.handleList(true, 3), 500);
          },
          () => {
            return ADN.overview!.list!.elementsSelector().attr('href');
          },
        );
      }
    });
  },
};

function getEpisode(url, forceZero = false) {
  const temp = url.match(/(episode|folge)-(\d+)/i);
  if (!temp) return forceZero ? 0 : 1;
  return Number(temp[2]);
}
