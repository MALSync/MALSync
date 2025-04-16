import { PageInterface } from '../pageInterface';

export const ZeroScans: PageInterface = {
  name: 'ZeroScans',
  domain: 'https://zeroscans.com',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    return utils.urlPart(url, 3) === 'comics' && url.split('/').length === 6;
  },
  isOverviewPage(url) {
    return utils.urlPart(url, 3) === 'comics' && url.split('/').length === 5;
  },
  sync: {
    getTitle(url) {
      return j.$('.d-flex a:nth-child(3)').first().text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(j.$('.d-flex a:nth-child(3)').attr('href'), ZeroScans.domain);
    },
    getEpisode(url) {
      const episodePart = j.$('.d-flex a:nth-child(5)').text();

      const temp = episodePart.match(/chapter\s(\d+)/i);

      if (!temp || temp.length < 2) return 0;

      return Number(temp[1]);
    },
    nextEpUrl(url) {
      return utils.absoluteLink(j.$('.d-flex a:nth-child(6)').attr('href'), ZeroScans.domain);
    },
  },
  overview: {
    getTitle(url) {
      return j.$('.v-card__title.text-h4').text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('.w-100.zs-bg-1.elevation-2.rounded').after(
        j.html(
          `<div class="rounded w-100 my-5"><div class="zs-bg-1 elevation-2 w-100 archive_chapters v-card v-sheet theme--dark"><div class="d-flex align-center pl-4 pr-2 pt-4" style="gap:10px;"><div class="v-toolbar__title">MAL-Sync</div> <hr role="separator" aria-orientation="horizontal" class="v-divider theme--dark"> </div><div id="malthing">${selector}</div></div></div>`,
        ),
      );
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.row.pa-4 .col-md-6 a');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), ZeroScans.domain);
      },
      elementEp(selector) {
        return Number(selector.find('span.font-weight-bold').text());
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(() => {
      if (document.title.includes('Page not found')) {
        con.error('404');
        return;
      }
      start();
      utils.changeDetect(
        () => {
          page.reset();
          start();
        },
        () => {
          return j.$('head title').text() || '';
        },
      );
      function start() {
        if (ZeroScans.isOverviewPage!(page.url)) {
          utils.waitUntilTrue(
            () => {
              return $('.row.pa-4 .col-md-6 .v-skeleton-loader').length === 0;
            },
            () => {
              page.handlePage();
            },
          );
        } else {
          page.handlePage();
        }
      }
    });
  },
};
