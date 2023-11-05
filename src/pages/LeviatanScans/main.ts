import { pageInterface } from '../pageInterface';

export const LeviatanScans: pageInterface = {
  name: 'LeviatanScans',
  domain: ['https://lscomic.com', 'https://en.leviatanscans.com'],
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    if (j.$('.reading-manga .chapter-type-manga').length) {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    if (j.$('.manga-page .profile-manga').length) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$(j.$('.c-breadcrumb-wrapper .breadcrumb li a')[1]).text().trim();
    },
    getIdentifier(url) {
      if (utils.urlPart(url, 3) === 'manga') {
        return utils.urlPart(url, 4);
      }
      return utils.urlPart(url, 5);
    },
    getOverviewUrl(url) {
      const overviewUrl = j.$(j.$('.c-breadcrumb-wrapper .breadcrumb li a')[1]).attr('href') || '';

      const temp = overviewUrl.split('/');

      if (temp[3] === 'manga') return overviewUrl;

      temp.splice(3, 1);

      return temp.join('/');
    },
    getEpisode(url) {
      const episodePart = j.$('#manga-reading-nav-head').attr('data-chapter') || '';

      const temp = episodePart.match(/\d+/i);

      if (!temp || temp.length === 0) return 1;

      return Number(temp[0].replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      const epUrl = j.$('.nav-links .next_page').attr('href') || '';

      const temp = epUrl.split('/');

      if (temp[3] === 'manga') return epUrl;

      temp.splice(3, 1);

      return temp.join('/');
    },
  },
  overview: {
    getTitle(url) {
      return j.$(j.$('.post-title > h1')).text().trim();
    },
    getIdentifier(url) {
      if (utils.urlPart(url, 3) === 'manga') {
        return utils.urlPart(url, 4);
      }
      return utils.urlPart(url, 5);
    },
    uiSelector(selector) {
      j.$('.profile-manga')
        .first()
        .after(
          j.html(
            `<div id="malthing" class="container"><div id= "MALSyncheading" class="c-blog__heading style-2 font-heading"><h2 class="h4"> <i class="icon ion-ios-star"></i> MAL-Sync</h2></div>${selector}</div>`,
          ),
        );
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.wp-manga-chapter');
      },
      elementUrl(selector) {
        return selector.find('a').first().attr('href') || '';
      },
      elementEp(selector) {
        let episodePart = utils.urlPart(LeviatanScans.overview!.list!.elementUrl!(selector), 5);

        if (episodePart.match(/season-\d+/gim)) {
          episodePart = utils.urlPart(LeviatanScans.overview!.list!.elementUrl!(selector), 6);
        }

        const temp = episodePart.match(/\d+/i);

        if (!temp || temp.length === 0) return 1;

        return Number(temp[0].replace(/\D+/g, ''));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(() => {
      if (LeviatanScans.isSyncPage(page.url)) {
        page.handlePage();
      }
      if (LeviatanScans.isOverviewPage!(page.url)) {
        utils.waitUntilTrue(
          function () {
            return j.$('.wp-manga-chapter').length > 0;
          },
          function () {
            page.handlePage();
          },
        );
      }
    });
  },
};
