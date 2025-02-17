import { pageInterface } from '../pageInterface';
import { v3, getChapter } from './v3';

function getVersion() {
  return j.$('a.position-absolute > small').length > 0 ? 2 : 3;
}

export const bato: pageInterface = {
  name: 'bato',
  domain: 'https://bato.to',
  languages: ['Many'],
  type: 'manga',
  isSyncPage(url) {
    if (url.split('/')[3] === 'chapter') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('h3.nav-title > a').text();
    },
    getIdentifier(url) {
      return utils.urlPart(bato.sync.getOverviewUrl(url), 4) || '';
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(j.$('h3.nav-title > a').attr('href'), bato.domain);
    },
    getEpisode(url) {
      const selectedOptionText = j.$('div.nav-epis > select > optgroup > option:selected').text();

      if (!selectedOptionText) return NaN;

      return getChapter(selectedOptionText);
    },
    getVolume(url) {
      const selectedOptionText = j.$('div.nav-epis > select > optgroup > option:selected').text();

      if (!selectedOptionText) return NaN;

      const chapterTextMatches = /(vol\.|volume)\D?\d+/i.exec(selectedOptionText);

      if (!chapterTextMatches || chapterTextMatches.length === 0) return NaN;

      return Number(/\d+/.exec(chapterTextMatches[0]));
    },
    nextEpUrl(url) {
      const href = utils.absoluteLink(j.$('div.nav-next > a').first().attr('href'), bato.domain);
      if (href.split('/')[3] === 'chapter') {
        return href;
      }
      return '';
    },
    readerConfig: [
      {
        condition: '.item:nth-child(2)',
        current: {
          selector: '#viewer > .item',
          mode: 'countAbove',
        },
        total: {
          selector: '.page-num',
          mode: 'text',
          regex: '\\d+$',
        },
      },
      {
        condition: 'div[name="image-items"] > div > div[name="image-item"]:nth-child(2)',
        current: {
          selector: 'div[name="image-item"]',
          mode: 'countAbove',
        },
        total: {
          selector: 'div[name="image-item"] span.text-3xl',
          mode: 'text',
          regex: '\\d+$',
        },
      },
      {
        condition: 'div[name="image-item"]',
        current: {
          selector: 'div[name="image-item"] > div > span:nth-child(1)',
          mode: 'text',
          regex: '^\\d+',
        },
        total: {
          selector: 'div[name="image-item"] > div > span:nth-child(1)',
          mode: 'text',
          regex: '\\d+$',
        },
      },
      {
        current: {
          selector: '.page-num',
          mode: 'text',
          regex: '^\\d+',
        },
        total: {
          selector: '.page-num',
          mode: 'text',
          regex: '\\d+$',
        },
      },
    ],
  },
  overview: {
    getTitle(url) {
      return j.$('h3.item-title > a').first().text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4) || '';
    },
    uiSelector(selector) {
      j.$('h3.item-title').first().after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div.episode-list > div.main > div.item');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.find('a').first().attr('href'), bato.domain);
      },
      elementEp(selector) {
        const episodeText = selector.find('a > b').text();

        if (!episodeText) return NaN;

        return getChapter(episodeText);
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(function () {
      if (getVersion() === 3) {
        bato.isSyncPage = v3.isSyncPage;
        bato.sync = v3.sync;
        bato.overview = v3.overview;
        bato.name = v3.name;
        v3.init(page);
        return;
      }
      if (page.url.split('/')[3] === 'chapter' || page.url.split('/')[3] === 'series') {
        page.handlePage();
      }
    });
  },
};
