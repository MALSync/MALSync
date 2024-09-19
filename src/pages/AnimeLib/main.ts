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
      const partUrl = j.$('.am_ap a').attr('href')!.split('?')[0];
      const overview = utils.absoluteLink(partUrl, AnimeLib.domain);
      return overview;
    },
    getEpisode(url: string): number {
      return parseInt(j.$('.t4_f5').text());
    },
    nextEpUrl(url: string): string | undefined {
      let id = j.$('.t4_f5').next().attr('id');
      if (!id) return undefined;
      id = id.replace('_', '=');
      const ep = url.split('?').shift();
      return `${ep}?${id}`;
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

    let interval: number | NodeJS.Timeout;
    utils.changeDetect(check, () => {
      return j.$('meta[property="og:url').attr('content');
    });
    check();

    function check() {
      page.reset();
      con.info('Start checking current page');
      // when we are on SYNC page
      if (AnimeLib.isSyncPage(page.url)) {
        con.info('This is a sync page');
        clearInterval(interval);
        interval = utils.changeDetect(
          () => {
            page.reset();
            page.handlePage();
          },
          () => {
            return detectChangeInPlayer();
          },
          true,
        );
      }
      // when we are on OVERVIEW page
      if (AnimeLib.isOverviewPage!(page.url)) {
        con.info('This is an overview page');
        clearInterval(interval);
        interval = utils.waitUntilTrue(
          () => {
            return !!j.$('.tabs-item').length;
          },
          () => {
            page.handlePage();
          },
          500,
        );
      }
    }

    function detectChangeInPlayer() {
      const episode = j.$('.t4_f5').text();
      // .i_m   - AnimeLib player (video)
      // .mn_mo - Kodik player (iframe)
      const player = j.$(j.$('.i_m') || j.$('.mn_mo')).attr('src');
      const dubSub = j.$('.tabs-item.is-active').text();
      return JSON.stringify({
        episode,
        player,
        dubSub,
      });
    }
  },
};
