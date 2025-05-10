import { PageInterface } from '../pageInterface';

export const BlueSolo: PageInterface = {
  name: 'BlueSolo',
  domain: 'https://www.bluesolo.org',
  languages: ['French'],
  type: 'manga',
  isSyncPage(url) {
    return typeof url.split('/')[5] !== 'undefined' && url.split('/')[5] !== '';
  },
  sync: {
    getTitle() {
      return j.$('div.c-breadcrumb > ol > li:nth-child(3) > a').text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl() {
      return utils.absoluteLink(
        j.$('div.c-breadcrumb > ol > li:nth-child(3) > a').attr('href'),
        BlueSolo.domain,
      );
    },
    getEpisode(url) {
      const type = url.split('/')[5];
      if (type.includes('chapitre')) {
        return Number(type.replace('chapitre-', ''));
      }
      if (type.includes('one-shot')) {
        return 1;
      }
      return NaN;
    },
    nextEpUrl() {
      const nextChapter = j
        .$('.selectpicker_chapter select option:selected')
        .prev()
        .attr('data-redirect');
      return utils.absoluteLink(nextChapter, BlueSolo.domain);
    },
  },
  overview: {
    getTitle() {
      return j.$('.post-title > h1').text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('.tab-summary ').after(
        j.html(`<div class="pagemanga">
          <div class="c-blog__heading style-2 font-heading">
            <h2 class="h4">
              <i class="icon ion-ios-sync"></i>
              MAL-SYNC </h2>
          </div>
          ${selector}
        </div>`),
      );
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.version-chap > li.wp-manga-chapter');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector.find('a[href*="/manga/"]').attr('href') || '',
          BlueSolo.domain,
        );
      },
      elementEp(selector) {
        return BlueSolo.sync.getEpisode(BlueSolo.overview!.list!.elementUrl!(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function () {
      if (page.url.split('/')[3] === 'manga' && typeof page.url.split('/')[4] !== 'undefined') {
        con.info('Waiting');
        utils.waitUntilTrue(
          () => {
            return (
              (j.$('.post-title > h1').length && j.$('.profile-manga').length) ||
              j.$('#chapter-heading')
            );
          },
          () => {
            con.info('Start');
            page.handlePage();
          },
        );
      }
    });
  },
};
