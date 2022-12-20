import { pageInterface } from '../pageInterface';

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

      const chapterTextMatches = selectedOptionText.match(/(vol\.|volume)\D?\d+/i);

      if (!chapterTextMatches || chapterTextMatches.length === 0) return NaN;

      return Number(chapterTextMatches[0].match(/\d+/));
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
    j.$(document).ready(function () {
      if (page.url.split('/')[3] === 'chapter' || page.url.split('/')[3] === 'series') {
        page.handlePage();
      }
    });
  },
};

function getChapter(text: string) {
  const res = /(ch|chapter|episode|ep|chap|chp)\D?(\d+)/i.exec(text);

  if (!res) return NaN;

  return Number(res[2]) || NaN;
}
