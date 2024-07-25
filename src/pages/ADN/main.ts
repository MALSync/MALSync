import { pageInterface } from '../pageInterface';

export const ADN: pageInterface = {
  name: 'ADN',
  domain: 'https://animationdigitalnetwork.com',
  languages: ['French', 'German'],
  type: 'anime',
  isSyncPage(url) {
    return utils.urlPart(nUrl(url), 3) === 'video' && Boolean(utils.urlPart(nUrl(url), 5));
  },
  isOverviewPage(url) {
    return utils.urlPart(nUrl(url), 3) === 'video' && !utils.urlPart(nUrl(url), 5);
  },
  sync: {
    getTitle(url) {
      return j.$('div[data-testid="player-content"] h1 a').text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(nUrl(url), 4) || '';
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
      return utils.urlPart(nUrl(url), 4) || '';
    },
    uiSelector(selector) {
      j.$('#comments-panel, [data-testid="Homeshowlist"]')
        .first()
        .parent()
        .children('div')
        .first()
        .append(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('[data-testid="default-layout"] ul li a[href*="/video/"][title]');
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
    let checkInterval: NodeJS.Timer;

    utils.fullUrlChangeDetect(() => {
      page.reset();
      clearInterval(checkInterval);
      if (ADN.isSyncPage(window.location.href)) {
        checkInterval = utils.waitUntilTrue(
          () => ADN.sync!.getTitle(window.location.href),
          () => page.handlePage(),
        );
      } else if (ADN.isOverviewPage!(window.location.href)) {
        checkInterval = utils.waitUntilTrue(
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

function nUrl(url) {
  if (utils.urlPart(url, 4) === 'video') {
    return url.replace(`/${utils.urlPart(url, 3)}/`, '/');
  }

  return url;
}
