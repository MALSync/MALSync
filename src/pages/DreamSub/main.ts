import { pageInterface } from '../pageInterface';

let jsonData;

export const DreamSub: pageInterface = {
  name: 'DreamSub',
  domain: 'https://dreamsub.cc',
  languages: ['Italian'],
  type: 'anime',
  isSyncPage(url) {
    return jsonData.isStreaming;
  },
  sync: {
    getTitle(url) {
      return jsonData.animeName;
    },
    getIdentifier(url) {
      return jsonData.clean;
    },
    getOverviewUrl(url) {
      return jsonData.overview_url;
    },
    getEpisode(url) {
      return jsonData.nEpisode;
    },
    nextEpUrl(url) {
      if (jsonData.nextEpisode) {
        return jsonData.nextEpisode;
      }
      return '';
    },
    getMalUrl(provider) {
      if (jsonData.mal_id) {
        return `https://myanimelist.net/anime/${jsonData.mal_id}`;
      }
      return false;
    },
  },
  overview: {
    getTitle(url) {
      return DreamSub.sync.getTitle(url);
    },
    getIdentifier(url) {
      return DreamSub.sync.getIdentifier(url);
    },
    uiSelector(selector) {
      j.$('div.detail-content')
        .first()
        .after(j.html(selector));
    },
    getMalUrl(provider) {
      if (jsonData.mal_id) {
        return `https://myanimelist.net/anime/${jsonData.mal_id}`;
      }
      return false;
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('ul#episodes-sv ul.innerSeas > li.ep-item').filter(function(index) {
          if ($(this).find('div.sli-name > a.disabled').length) {
            return false;
          }
          return true;
        });
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('div.sli-name > a')
            .first()
            .attr('href'),
          DreamSub.domain,
        );
      },
      elementEp(selector) {
        return parseInt(DreamSub!.overview!.list!.elementUrl(selector).split('/')[5]);
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    if (document.title === 'Verifica che non sei un bot | DreamSub') {
      con.log('loading');
      page.cdn();
      return;
    }
    j.$(document).ready(function() {
      utils.waitUntilTrue(
        function() {
          return j.$('#syncData').length;
        },
        function() {
          jsonData = JSON.parse(j.$('#syncData').text());
          page.handlePage();
        },
      );
    });
  },
};
