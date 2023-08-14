import { pageInterface } from '../pageInterface';
import { SyncPage } from '../syncPage';

export const Anix: pageInterface = {
  domain: 'https://anix.to',
  languages: ['English'],
  name: 'Anix',
  type: 'anime',
  isSyncPage(url: string): boolean {
    return true;
  },
  sync: {
    getTitle(url: string): string {
      return j.$('h1.anime-name').text().trim();
    },
    getIdentifier(url: string): string {
      const anime = url.split('/')[4];
      return anime.split('-')[4];
    },
    getOverviewUrl(url: string): string {
      return utils.absoluteLink(
        j.$('div.range-wrap > div.range > div > a').first().attr('href'),
        Anix.domain,
      );
    },
    getEpisode(url: string): number {
      return parseInt(j.$('div.range-wrap > div.range > div > a.active').text());
    },
    nextEpUrl(url: string): string | undefined {
      return j
        .$('div.range-wrap > div.range > div > a.active')
        .parent('div')
        .next()
        .find('a')
        .attr('href');
    },
    uiSelector(selector) {
      j.$('#ani-episode').after(j.html(selector));
    },
    readerConfig: undefined,
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
        return j.$(
          'div.ani-episode > div.range-wrap > div.range > div > a:not([style*="display: none"])',
        );
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), Anix.domain);
      },
      elementEp(selector) {
        return Number(selector.attr('data-num'));
      },
      paginationNext() {
        const pageElements = j.$('#ani-episode > div.head > div > div > div.dropdown-menu > a');
        if (pageElements.length <= 1) return false;

        const activePageIndex = pageElements.index(j.$('active'));
        if (activePageIndex < pageElements.length - 1) {
          const btnNext = j.$('div.range-ctrls > div').attr('data-value', 'next');
          btnNext.trigger('click');
          return true;
        }
        return false;
      },
    },
  },
  init(page: SyncPage): void {
    // Stops all keys from changing the episode and anything else, when the correction menu is open
    document.addEventListener('keydown', e => {
      if (isCorrectionMenuOpen()) {
        e.stopImmediatePropagation();
        con.info('Correction menu is open, stopped keydown event');
      }
    });

    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    utils.waitUntilTrue(
      function () {
        const loaded = j
          .$('div.range')
          .toArray()
          .some(el => el.style.display !== 'none');
        return loaded && j.$('div.range div a').length;
      },
      function () {
        con.info('Start check');
        page.handlePage();

        utils.urlChangeDetect(function () {
          con.info('Url change');
          page.reset();
          page.handlePage();
        });

        utils.changeDetect(
          () => {
            page.handleList();
          },
          () => {
            return j.$('div.ani-episode > div.head > div > div.dropdown > button').text();
          },
        );
      },
    );
  },
};

function isCorrectionMenuOpen() {
  return j.$('div.type-correction').length > 0; // Returns true if the menu is found and false if not
}
