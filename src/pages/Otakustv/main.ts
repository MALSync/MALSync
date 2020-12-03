import { pageInterface } from '../pageInterface';

export const Otakustv: pageInterface = {
  name: 'Otakustv',
  domain: 'https://www.otakustv.com',
  languages: ['Spanish'],
  type: 'anime',
  isSyncPage(url) {
    if (utils.urlPart(url, 5)) {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    if (utils.urlPart(url, 4) && !utils.urlPart(url, 5)) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      const title = j
        .$('title')
        .text()
        .trim();
      const content = j
        .$('.epsd h1')
        .text()
        .trim();

      // Check when strings deviate
      let endTitle = '';

      for (let i = 0; i < title.length; i++) {
        if (title[i] && content[i] && title[i] === content[i]) {
          endTitle += title[i];
        }
      }

      return endTitle.trim();
    },
    getIdentifier(url) {
      return Otakustv.overview!.getIdentifier(url);
    },
    getOverviewUrl(url) {
      return `${Otakustv.domain}/anime/${Otakustv.sync.getIdentifier(url)}`;
    },
    getEpisode(url) {
      return getEpisode(url);
    },
    nextEpUrl(url) {
      const href = j
        .$('.vid_next a')
        .first()
        .attr('href');
      if (typeof href !== 'undefined' && !href.includes(':void(0)')) {
        return utils.absoluteLink(href, Otakustv.domain);
      }
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('.inn-text h1')
        .first()
        .text()
        .trim();
    },
    getIdentifier(url) {
      const urlPart4 = utils.urlPart(url, 4);

      if (!urlPart4) return '';

      return urlPart4;
    },
    uiSelector(selector) {
      j.$('.inn-text h1')
        .first()
        .after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.episodios-bottom .row > div');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('a')
            .first()
            .attr('href'),
          Otakustv.domain,
        );
      },
      elementEp(selector) {
        return getEpisode(Otakustv.overview!.list!.elementUrl(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      page.handlePage();
    });
  },
};

function getEpisode(url) {
  const epPath = utils.urlPart(url, 5).toLowerCase();
  if (epPath === 'pelicula') return 1;
  const temp = epPath.match(/\d+$/gim);

  if (!temp || temp.length === 0) return 1;

  return Number(temp);
}
