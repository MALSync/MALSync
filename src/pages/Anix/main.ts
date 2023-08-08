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
      const title = j.$('div.ani-name h1').text();
      // con.log(`sync getTitle / ${title}`);

      return title.trim();
    },
    getIdentifier(url: string): string {
      const anime = url.split('/')[4];
      const id = anime.split('-')[4];
      // con.log(`sync getIdentifier / ${id}`);
      return id;
    },
    getOverviewUrl(url: string): string {
      const href = j.$('div.range-wrap > div.range > div > a').first().attr('href');
      // con.log(`sync getOverviewUrl url / ${href}`);
      return utils.absoluteLink(href, Anix.domain);
    },
    getEpisode(url: string): number {
      const ep = parseInt(j.$('div.range-wrap > div.range > div > a.active').text());
      // con.log(`sync getEpisode / ${ep}`);
      return ep;
    },
    nextEpUrl(url: string): string | undefined {
      const epUrl = j
        .$('div.range-wrap > div.range > div > a.active')
        .parent('div')
        .next()
        .find('a')
        .attr('href');
      // con.log(`sync nextEpUrl / ${epUrl}`);
      return epUrl;
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
        const elements = j.$(
          'div.ani-episode > div.range-wrap > div.range > div > a:not([style*="display: none"])',
        );
        // con.log('list elementsSelector / ');
        // con.log(elements);
        return elements;
      },
      elementUrl(selector) {
        const href = selector.attr('href');
        // con.log('list elementUrl / ');
        // con.log(href);
        return utils.absoluteLink(href, Anix.domain);
      },
      elementEp(selector) {
        const ep = Number(selector.attr('data-num'));
        // con.log('list elementEp /');
        // con.log(ep);
        return ep;
      },
      paginationNext() {
        const pageElements = j.$('#ani-episode > div.head > div > div > div.dropdown-menu > a');
        // con.log('list paginationNext pageElements /');
        // con.log(pageElements);
        if (pageElements.length <= 1) return false;

        const activePageIndex = pageElements.index(j.$('active'));
        // con.log('list paginationNext activePageIndex /');
        // con.log(activePageIndex);
        if (activePageIndex < pageElements.length - 1) {
          const btnNext = j.$('div.range-ctrls > div').attr('data-value', 'next');
          btnNext.trigger('click');
          // con.log('list paginationNext click');
          return true;
        }
        // con.log('list paginationNext no click');
        return false;
      },
    },
  },
  init(page: SyncPage): void {
    // Stops all keys from changing the episode and anything else, when the correction menu is open
    document.addEventListener('keydown', e => {
      const isOpen = isCorrectionMenuOpen();
      if (isOpen) {
        e.stopImmediatePropagation();
        con.log('Correction menu is open, stopping keydown event');
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
            const text = j.$('div.ani-episode > div.head > div > div.dropdown > button').text();
            // con.log(`changeDetect / ${text}`);
            return text;
          },
        );
      },
    );
  },
};

function isCorrectionMenuOpen() {
  const correctionMenu = j.$('div.type-correction');
  return correctionMenu.length > 0; // Returns true if the menu is found and false if not
}
