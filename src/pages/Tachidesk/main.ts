import { fullUrlChangeDetect } from '../../utils/general';
import { pageInterface } from '../pageInterface';

export const Tachidesk: pageInterface = {
  name: "Tachidesk",
  domain: "http://127.0.0.1:4567",
  languages: [ "English" ],
  type: "manga",
  isSyncPage(url) {
    if (url.split('/')[5] === 'chapter') {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    if (url.split('/')[3] == 'manga') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$("title").text().replace(/(.+): .+ - Tachidesk/g,'$1').replace(' - Tachidesk','');
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return url.split('chapter')[0];
    },
    getEpisode(url) {
      return parseInt(utils.urlPart(url, 6));
    },
    getVolume(url) {
      let temp = utils
        .getBaseText(j.$("title"))
        .match(/(vol\.|volume)\D?\d+/i);
      if (temp) {
        temp = temp[0].match(/\d+/);
        if (temp) {
          return parseInt(temp[0]);
        }
      }
      return 0;
    },
    nextEpUrl(url) {
      return url.split('chapter')[0] + 'chapter/' + (parseInt(url.split('/')[6]) + 1);
    },
    // readerConfig: [
    //   {
    //     current: {
    //       selector: '.css-1jde78a',
    //       mode: 'text',
    //       regex: '^\\d+',
    //     },
    //     total: {
    //       selector: '.css-1jde78a',
    //       mode: 'text',
    //       regex: '\\d+$',
    //     },
    //   },
    // ],
  },
  overview: {
    getTitle(url) {
      return j.$('h1').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('h4').first().after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('ul.chaptersList > li.chapter-item');
      },
      elementUrl(selector) {
        return  utils.absoluteLink(selector.find("a").first().attr("href") || "", Tachidesk.domain);
      },
      elementEp(selector) {
        return Tachidesk.sync.getEpisode(Tachidesk.overview!.list!.elementUrl!(selector));
      },
    },
  },
  init(page) {
    let interval;
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    utils.fullUrlChangeDetect(() => {
        page.reset();
        clearInterval(interval);
        interval = utils.waitUntilTrue(() => {
            return j.$("title").length;
        }, () => {
            page.handlePage();
        });
    });
}
};