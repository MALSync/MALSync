import { pageInterface } from './../pageInterface';

let jsonData;

export const DreamSub: pageInterface = {
  name: 'DreamSub',
  domain: 'https://dreamsub.stream',
  type: 'anime',
  isSyncPage: function(url) {
    return jsonData.isStreaming;
  },
  sync: {
    getTitle: function(url) {
      return jsonData.animeName;
    },
    getIdentifier: function(url) {
      return jsonData.clean;
    },
    getOverviewUrl: function(url) {
      return jsonData.overview_url;
    },
    getEpisode: function(url) {
      return jsonData.nEpisode;
    },
    nextEpUrl: function(url) {
      if (jsonData.nextEpisode) {
        return jsonData.nextEpisode;
      }
    },
    getMalUrl: function(provider) {
      if (jsonData.mal_id) {
        return `https://myanimelist.net/anime/${jsonData.mal_id}`;
      }
      return false;
    },
  },
  overview: {
    getTitle: function(url) {
      return DreamSub.sync.getTitle(url);
    },
    getIdentifier: function(url) {
      return DreamSub.sync.getIdentifier(url);
    },
    uiSelector: function(selector) {
      selector.insertAfter(j.$('div.detail-content').first());
    },
    getMalUrl: function(provider) {
      if (jsonData.mal_id) {
        return `https://myanimelist.net/anime/${jsonData.mal_id}`;
      }
      return false;
    },
    list: {
      offsetHandler: false,
      elementsSelector: function() {
        return j
          .$('ul#episodes-sv ul.innerSeas > li.ep-item')
          .filter(function(index) {
            if ($(this).find('div.sli-name > a.disabled').length) {
              return false;
            } else {
              return true;
            }
          });
      },
      elementUrl: function(selector) {
        return utils.absoluteLink(
          selector
            .find('div.sli-name > a')
            .first()
            .attr('href'),
          DreamSub.domain,
        );
      },
      elementEp: function(selector) {
        return parseInt(
          DreamSub!.overview!.list!.elementUrl(selector).split('/')[5],
        );
      },
    },
  },
  init(page) {
    if (document.title === 'Just a moment...') {
      con.log('loading');
      page.cdn();
      return;
    }
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
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
