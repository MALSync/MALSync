import { pageInterface } from '../pageInterface';
import { SyncPage } from '../syncPage';

// const selectedEpisodeQuery = '#ani-episode a.active';
// const episodeLinkButtonsQuery = '#ani-episode a:not([href="#"])';

export const AnimeLib: pageInterface = {
  domain: 'https://anilib.me',
  languages: ['Russian'],
  name: 'AnimeLib',
  type: 'anime',
  getImage() {
    return $('.cover > img').attr('src');
  },
  isSyncPage(url: string): boolean {
    return utils.urlPart(url, 6) !== '';
  },
  isOverviewPage(url: string): boolean {
    return utils.urlPart(url, 6) === '';
  },
  sync: {
    getTitle(url: string): string {
      con.info('getTitle', j.$('.am_ap > h1').text().trim());
      return j.$('.am_ap > h1').text().trim();
    },
    getIdentifier(url: string): string {
      con.info('getIdentifier', utils.urlPart(url, 5));
      return utils.urlPart(url, 5);
    },
    getOverviewUrl(url: string): string {
      const partUrl = j.$('.am_ap').find('a').attr('href');
      const overview = utils.absoluteLink(partUrl, AnimeLib.domain);
      con.info('getOverviewUrl', overview);
      return overview;
    },
    getEpisode(url: string): number {
      const ep = parseInt(
        j.$('.lh_e8.ef_aa').find('.t4_f5').find('span').text().split(' ')[0].trim(),
      );
      con.info('getEpisode', ep);
      return ep;
    },
    nextEpUrl(url: string): string | undefined {
      const id = (j.$('.lh_e8.ef_aa').find('.t4_f5').next().attr('id') || '').replace('_', '=');
      const ep = url.split('?').shift();
      con.info('nextEpUrl', `${ep}?${id}`);
      return `${ep}?${id}`;
    },
    uiSelector(selector) {
      j.$('.lh_e').after(j.html(`<div class="_container lh_e">${selector}</div>`));
    },
  },
  overview: {
    getTitle(url) {
      con.info('getTitle', j.$('.o6_o8 > span').text().trim());
      return j.$('.o6_o8 > span').text().trim();
    },
    getIdentifier(url) {
      con.info('getIdentifier', utils.urlPart(url, 5));
      return utils.urlPart(url, 5);
    },
    uiSelector(selector) {
      j.$('.tabs._border').before(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(
      // eslint-disable-next-line global-require
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    let Interval;
    j.$(() => {
      check();
      utils.fullUrlChangeDetect(() => {
        page.reset();
        check();
      });
    });
    function check() {
      // check for correct manga url
      if (
        document.title.includes('Страница не найдена 404') ||
        document.title === '404' ||
        j.$('.errors-page-text__title').text().trim() === '404'
      ) {
        con.error('Error 404');
        return;
      }
      // check if it's a SYNC/OVERVIEW page
      if (
        !AnimeLib.isSyncPage(window.location.href) &&
        !AnimeLib.isOverviewPage!(window.location.href)
      )
        return;
      // when we are on SYNC page
      if (AnimeLib.isSyncPage(window.location.href)) {
        clearInterval(Interval);
        Interval = utils.waitUntilTrue(
          () => {
            return !!j.$('.menu-item.is-active').length;
          },
          () => {
            page.handlePage();
          },
        );
      }
      // when we are on OVERVIEW page
      if (AnimeLib.isOverviewPage!(window.location.href)) {
        clearInterval(Interval);
        Interval = utils.waitUntilTrue(
          () => {
            return !!j.$('.tabs-item').length;
          },
          () => {
            page.handlePage();
          },
        );
      }
    }
  },
};
