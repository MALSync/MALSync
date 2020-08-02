import { pageInterface } from '../pageInterface';

export const MangaNelo: pageInterface = {
  name: 'MangaNelo',
  domain: 'https://manganelo.com',
  database: 'MangaNelo',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    if (url.split('/')[3] === 'chapter') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('div.body-site > div > div.panel-breadcrumb > a:nth-child(3)').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return j.$('div.body-site > div > div.panel-breadcrumb > a:nth-child(3)').attr('href') || '';
    },
    getEpisode(url) {
      return Number(url.split('/')[5].match(/\d+/gim));
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
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('div.panel-story-chapter-list')
        .first()
        .before(
          j.html(
            `<div id="malthing" class="panel-story-chapter-list"> <p class="row-title-chapter" style="width: 100%;"><span class="row-title-chapter-name">MAL-Sync</span></p> <div class="panel-story-info-description" style="border-top: 0;margin-top: 0;">${selector}</div></div>`,
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
        return selector
          .find('a')
          .first()
          .attr('href')
          .split('/')[5]
          .match(/\d+/gim);
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (page.url.split('/')[3] === 'chapter' || page.url.split('/')[3] === 'manga') {
        page.handlePage();
      }
    });
  },
};
