import { pageInterface } from '../pageInterface';

export const MangaNato: pageInterface = {
  name: 'MangaNato',
  domain: ['https://manganato.com', 'https://readmanganato.com'],
  database: 'MangaNato',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    return (
      typeof url.split('/')[3] !== 'undefined' &&
      url.split('/')[3].startsWith('manga-') &&
      typeof url.split('/')[4] !== 'undefined' &&
      url.split('/')[4].length > 0
    );
  },
  isOverviewPage(url) {
    return (
      typeof url.split('/')[3] !== 'undefined' &&
      url.split('/')[3].startsWith('manga-') &&
      typeof url.split('/')[4] === 'undefined'
    );
  },
  getImage() {
    return $('div.story-info-left > span.info-image > img').attr('src');
  },
  sync: {
    getTitle(url) {
      return j.$('div.body-site > div > div.panel-breadcrumb > a:nth-child(3)').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 3);
    },
    getOverviewUrl(url) {
      return j.$('div.body-site > div > div.panel-breadcrumb > a:nth-child(3)').attr('href') || '';
    },
    getEpisode(url) {
      const episodePart = utils.urlPart(url, 4);

      const temp = episodePart.match(/chapter[_-]\d+/gi);

      if (!temp || !temp.length) return 0;

      return Number(temp[0].replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      return j
        .$('div.panel-navigation > div > a.navi-change-chapter-btn-next.a-h')
        .first()
        .attr('href');
    },
  },
  overview: {
    getTitle(url) {
      return j.$('div.panel-story-info > div.story-info-right > h1').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 3);
    },
    uiSelector(selector) {
      j.$('div.panel-story-chapter-list')
        .first()
        .before(
          j.html(
            `<div id="malthing" class="panel-story-chapter-list"> <p class="row-title-chapter" style="width: 100%;"><span class="row-title-chapter-name">MAL-Sync</span></p> <div class="panel-story-info-description" style="border-top: 0;margin-top: 0;background: inherit;">${selector}</div></div>`,
          ),
        );
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div.panel-story-chapter-list > ul.row-content-chapter > li.a-h');
      },
      elementUrl(selector) {
        return (
          selector
            .find('a')
            .first()
            .attr('href') || ''
        );
      },
      elementEp(selector) {
        return MangaNato.sync.getEpisode(
          String(
            selector
              .find('a')
              .first()
              .attr('href'),
          ),
        );
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(() => {
      page.handlePage();
    });
  },
};
