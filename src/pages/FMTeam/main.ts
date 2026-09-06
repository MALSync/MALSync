import { pageInterface } from '../pageInterface';

export const FMTeam: pageInterface = {
  name: 'FMTeam',
  domain: 'https://fmteam.fr',
  languages: ['French'],
  type: 'manga',
  isSyncPage(url) {
    return url.split('/')[3] === 'read';
  },
  sync: {
    getTitle() {
      return j.$('#reader-sidebar > div > div:first-child > h4').text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl() {
      return utils.absoluteLink(j.$('.back-link').attr('href'), FMTeam.domain);
    },
    getVolume(url) {
      if (utils.urlPart(url, 6) === 'vol') {
        return Number(utils.urlPart(url, 7));
      }
      return 0;
    },
    getEpisode(url) {
      if (utils.urlPart(url, 6) === 'vol') {
        return Number(utils.urlPart(url, 9));
      }
      return Number(utils.urlPart(url, 7));
    },
    nextEpUrl() {
      return utils.absoluteLink(
        j.$('.page-nav-btn.chapter-btn').last().attr('href'),
        FMTeam.domain,
      );
    },
  },
  overview: {
    getTitle() {
      return j.$('.manga-title').clone().children().remove().end().text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('.chapters-header')
        .first()
        .before(
          j.html(
            `<div class="chapters-header"><span class="section-title">MAL-Sync</span></div>${selector}`,
          ),
        );
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.chapters-list .chapter-item');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), FMTeam.domain);
      },
      elementEp(selector) {
        return FMTeam.sync.getEpisode(FMTeam.overview!.list!.elementUrl!(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    let inter;

    utils.fullUrlChangeDetect(() => {
      page.reset();
      start();
    }, true);

    function start() {
      clearInterval(inter);
      const urlSegment = page.url.split('/')[3];
      const handlingPage = urlSegment === 'read' || urlSegment === 'manga';

      if (handlingPage && typeof page.url.split('/')[4] !== 'undefined') {
        con.info('Waiting');
        inter = utils.waitUntilTrue(
          () => {
            return j.$('.manga-header').length || j.$('#reader-sidebar').length;
          },
          () => {
            con.info('Start');
            page.handlePage();
          },
        );
      }
    }
  },
};
