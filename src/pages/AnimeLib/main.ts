import { pageInterface } from '../pageInterface';
import { SyncPage } from '../syncPage';

export const AnimeLib: pageInterface = {
  domain: 'https://anilib.me',
  languages: ['Russian'],
  name: 'AnimeLib',
  type: 'anime',
  getImage() {
    return $('.cover > img').attr('src');
  },
  isSyncPage(url: string): boolean {
    return utils.urlPart(url, 6) !== '' && utils.urlPart(url, 4) === 'anime';
  },
  isOverviewPage(url: string): boolean {
    return utils.urlPart(url, 6) === '' && utils.urlPart(url, 4) === 'anime';
  },
  sync: {
    getTitle(url: string): string {
      return j.$('.am_ap > h1').text().trim();
    },
    getIdentifier(url: string): string {
      return utils.urlPart(url, 5);
    },
    getOverviewUrl(url: string): string {
      const partUrl = j.$('.am_ap').find('a').attr('href')!.split('?')[0];
      const overview = utils.absoluteLink(partUrl, AnimeLib.domain);
      return overview;
    },
    getEpisode(url: string): number {
      const ep = parseInt(
        j.$('.lh_e8.ef_aa').find('.t4_f5').find('span').text().split(' ')[0].trim(),
      );
      return ep;
    },
    nextEpUrl(url: string): string | undefined {
      const id = (j.$('.lh_e8.ef_aa').find('.t4_f5').next().attr('id') || '').replace('_', '=');
      const ep = url.split('?').shift();
      return `${ep}?${id}`;
    },
    uiSelector(selector) {
      j.$('.lh_e').after(j.html(`<div class="_container lh_e">${selector}</div>`));
    },
  },
  overview: {
    getTitle(url) {
      return j.$('.o6_o8 > span').text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 5);
    },
    uiSelector(selector) {
      j.$('.tabs._border').before(j.html(selector));
    },
  },
  init(page: SyncPage) {
    api.storage.addStyle(
      // eslint-disable-next-line global-require
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    let Interval;
    j.$(() => {
      utils.fullUrlChangeDetect(() => {
        page.reset();
        check();
      });
    });
    function check() {
      // check for correct manga url
      con.info('Start checking current page');
      if (
        document.title.includes('Страница не найдена 404') ||
        document.title === '404' ||
        j.$('.errors-page-text__title').text().trim() === '404'
      ) {
        con.error('Error 404');
        return;
      }
      // when we are on SYNC page
      if (AnimeLib.isSyncPage(window.location.href)) {
        con.info('This is a sync page');
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
        con.info('This is an overview page');
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
