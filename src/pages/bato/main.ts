import { pageInterface } from '../pageInterface';

function getVersion() {
  return j.$('a.position-absolute > small').length > 0 ? 2 : 3;
}

export const bato: pageInterface = {
  name: 'bato',
  domain: 'https://bato.to',
  languages: ['Many'],
  type: 'manga',
  isSyncPage(url) {
    if (getVersion() === 2) {
      if (url.split('/')[3] === 'chapter') {
        return true;
      }
    } else if (j.$('div.comic-detail').length > 0) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      if (getVersion() === 2) {
        return j.$('h3.nav-title > a').text();
      }
      return j.$('div.comic-detail > h3 > a').text();
    },
    getIdentifier(url) {
      if (getVersion() === 2) {
        return utils.urlPart(bato.sync.getOverviewUrl(url), 4) || '';
      }
      return utils.urlPart(bato.sync.getOverviewUrl(url), 4).split('-')[0] || '';
    },
    getOverviewUrl(url) {
      if (getVersion() === 2) {
        return utils.absoluteLink(j.$('h3.nav-title > a').attr('href'), bato.domain);
      }
      return utils.absoluteLink(j.$('div.comic-detail > h3 > a').attr('href'), bato.domain);
    },
    getEpisode(url) {
      let selectedOptionText = '';
      if (getVersion() === 2) {
        selectedOptionText = j.$('div.nav-epis > select > optgroup > option:selected').text();
      } else {
        selectedOptionText = j
          .$('div.comic-detail ~ div > div > select:nth-child(1) > optgroup > option:selected')
          .text();
      }

      if (!selectedOptionText) return NaN;

      return getChapter(selectedOptionText);
    },
    getVolume(url) {
      let selectedOptionText = '';
      if (getVersion() === 2) {
        selectedOptionText = j.$('div.nav-epis > select > optgroup > option:selected').text();
      } else {
        selectedOptionText = j
          .$('div.comic-detail ~ div > div > select:nth-child(1) > optgroup > option:selected')
          .text();
      }

      if (!selectedOptionText) return NaN;

      const chapterTextMatches = /(vol\.|volume)\D?\d+/i.exec(selectedOptionText);

      if (!chapterTextMatches || chapterTextMatches.length === 0) return NaN;

      return Number(/\d+/.exec(chapterTextMatches[0]));
    },
    nextEpUrl(url) {
      let href = '';
      if (getVersion() === 2) {
        href = utils.absoluteLink(j.$('div.nav-next > a').first().attr('href'), bato.domain);
      } else {
        href = utils.absoluteLink(j.$('a.btn:nth-child(6)').first().attr('href'), bato.domain);
      }
      if (href.split('/')[3] === 'chapter') {
        return href;
      }
      if (href.split('/')[3].split('-')[0]) {
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
      if (getVersion() === 2) {
        return j.$('h3.item-title > a').first().text();
      }
      return j.$('h3.text-lg > a').first().text();
    },
    getIdentifier(url) {
      if (getVersion() === 2) {
        return utils.urlPart(url, 4) || '';
      }
      return utils.urlPart(url, 4).split('-')[0] || '';
    },
    uiSelector(selector) {
      if (getVersion() === 2) {
        j.$('h3.item-title').first().after(j.html(selector));
        return;
      }
      j.$('div.mt-3 > div:nth-child(3)').first().after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        if (getVersion() === 2) {
          return j.$('div.episode-list > div.main > div.item');
        }
        return j.$('div.scrollable-panel > div.group > astro-slot > div');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.find('a').first().attr('href'), bato.domain);
      },
      elementEp(selector) {
        let episodeText = '';

        if (getVersion() === 2) {
          episodeText = selector.find('a > b').text();
        } else {
          episodeText = selector.find('a').first().text();
        }

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
      if (
        page.url.split('/')[3] === 'chapter' ||
        page.url.split('/')[3] === 'series' ||
        page.url.split('/')[3] === 'title'
      ) {
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
