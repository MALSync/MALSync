import { pageInterface } from '../pageInterface';

export const MangaLib: pageInterface = {
  name: 'MangaLib',
  domain: 'https://mangalib.me',
  languages: ['Russian'],
  type: 'manga',
  getImage() {
    return $('.media-sidebar__cover.paper img').first().attr('src');
  },
  isSyncPage(url) {
    if ($('.reader').length) return true;
    return false;
  },
  isOverviewPage(url) {
    if ($('.media-container').length) return true;
    return false;
  },
  sync: {
    getTitle(url) {
      return $('.reader-header__wrapper > .reader-header-action > .reader-header-action__text')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 3);
    },
    getOverviewUrl(url) {
      return $('.reader-header__wrapper a').first().attr('href') || '';
    },
    getEpisode(url) {
      const episodePart = utils.urlPart(url, 5);
      return Number(episodePart.split('?')[0].replace('c', ''));
    },
    getVolume(url) {
      const volumePart = utils.urlPart(url, 4);
      return Number(volumePart.replace('v', ''));
    },
    nextEpUrl(url) {
      return $('[class="reader-header-actions"] > a').last().attr('href');
    },
    readerConfig: [
      {
        current: {
          selector: '.reader-pages > label > span',
          mode: 'text',
          regex: '\\d+',
        },
        total: {
          selector: '.reader-pages > label > span',
          mode: 'text',
          regex: '\\d+$',
        },
      },
    ],
  },
  overview: {
    getTitle(url) {
      return $('.media-name__main').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 3);
    },
    uiSelector(selector) {
      $('#media_type')
        .first()
        .after(
          j.html(
            `<div class="paper section tabs"><div class="media-section media-section_info"><div class=media-section__head><div class=media-section__title>MAL-Sync</div></div><hr><div class=media-description>${selector}</div></div></div>`,
          ),
        );
    },
  },
  init(page) {
    api.storage.addStyle(
      // eslint-disable-next-line global-require
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    let Interval;

    $(() => {
      check();
      utils.changeDetect(
        () => {
          page.reset();
          check();
        },
        () => {
          return $('head > meta[property="og:title"]').attr('content') || '';
        },
      );
    });

    function check() {
      if (
        document.title.includes('Страница не найдена 404') ||
        $('.text > .title').first().text() === '404'
      ) {
        con.error('Error 404');
        return;
      }
      if (
        !MangaLib.isSyncPage(window.location.href) &&
        !MangaLib.isOverviewPage!(window.location.href)
      )
        return;
      if (MangaLib.isSyncPage(window.location.href)) {
        clearInterval(Interval);
        Interval = utils.waitUntilTrue(
          () => {
            return $('#reader-pages > option[selected="true"]').length;
          },
          () => {
            page.handlePage();
          },
        );
      }
      if (MangaLib.isOverviewPage!(window.location.href)) {
        if ($('#malthing').length) {
          $('#malthing').remove();
        }
        clearInterval(Interval);
        Interval = utils.waitUntilTrue(
          () => {
            if ($('.media-name__main').length) {
              return true;
            }
            return false;
          },
          () => {
            page.handlePage();
          },
        );
      }
    }
  },
};
