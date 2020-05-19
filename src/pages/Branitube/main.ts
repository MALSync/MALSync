import { pageInterface } from './../pageInterface';
export const Branitube: pageInterface = {
  name: 'Branitube',
  domain: 'https://www.branitube.net',
  type: 'anime',
  isSyncPage: function(url) {
    if (url.split('/')[3] === 'watch') {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url) {
      if (getType() !== 'anime') {
        return `${j.$('.nomeAnime').text()} ${getType()}`;
      } else {
        return j.$('.nomeAnime').text();
      }
    },
    getIdentifier: function(url) {
      return `${j.$('.nomeAnime').data('anid')}?${getType().replace(
        /\s/gm,
        '',
      )}`;
    },
    getOverviewUrl: function(url) {
      const tempUrl =
        Branitube.domain + (j.$('div.buttonEpisodes > a').attr('href') || '');
      if (getType() === 'anime') {
        return tempUrl;
      } else if (getType() === 'ova') {
        return `${tempUrl}/ovas`;
      } else if (getType() === 'special') {
        return `${tempUrl}/especiais`;
      } else {
        return `${tempUrl}/filmes`;
      }
    },
    getEpisode: function(url) {
      if (getType().indexOf('movie') == -1) {
        return Number(
          j
            .$('.epInfo')
            .text()
            .replace(/\D+/g, ''),
        );
      } else {
        return 1;
      }
    },
    nextEpUrl: function(url) {
      if (
        getType().indexOf('movie') == -1 &&
        j.$('.cplPl').attr('data-npl') &&
        j.$('.cplPl').attr('data-cpl') &&
        j.$('.cplPl').attr('data-npltype') &&
        j.$('.cplPl').attr('data-cpl') == j.$('.cplPl').attr('data-npltype')
      ) {
        return `${Branitube.domain}/watch/${j.$('.cplPl').attr('data-npl')}/${
          url.split('/')[5]
        }`;
      }
    },
    getMalUrl: function(provider) {
      if (getType() === 'anime') {
        var malid = j.$('.nomeAnime').attr('data-anmalid');
        if (!malid || malid == '0') {
          var malid = j.$('.epInfo').attr('data-epmalid');
        }
      } else {
        var malid = j.$('.epInfo').attr('data-epmalid');
      }
      if (malid && malid !== '0') {
        return `https://myanimelist.net/anime/${malid}`;
      }
      return false;
    },
  },
  overview: {
    getTitle: function(url) {
      if (getType() !== 'anime') {
        return `${j
          .$('div.animeInfos > ul > li.largeSize')
          .text()} ${getType()}`;
      } else {
        return j.$('div.animeInfos > ul > li.largeSize').text();
      }
    },
    getIdentifier: function(url) {
      return `${url.split('/')[4]}?${getType()}`;
    },
    uiSelector: function(selector) {
      j.$(
        `<div class="animeResult" style="margin:8px;"> <p id="malp">${selector.html()}</p></div>`,
      ).prependTo(j.$('div.areaEpsList').first());
    },
    getMalUrl: function(provider) {
      if (getType() === 'anime') {
        var malid = j
          .$('div.animeInfos > ul > li.largeSize')
          .attr('data-malid');
      }
      if (malid && malid !== '0') {
        return `https://myanimelist.net/anime/${malid}`;
      }
      return false;
    },
    list: {
      offsetHandler: false,
      elementsSelector: function() {
        return j.$(
          '.areaEpsList > .getTotalShowingEp > .item-ep > div.area-ep',
        );
      },
      elementUrl: function(selector) {
        return utils.absoluteLink(
          selector
            .find('a')
            .first()
            .attr('href'),
          Branitube.domain,
        );
      },
      elementEp: function(selector) {
        return utils
          .getBaseText(
            selector
              .find('div.infos-bottom > div.ep-info > div.anime-content')
              .first(),
          )
          .replace(/\D+/g, '');
      },
    },
  },
  init(page) {
    if (document.title == 'Just a moment...') {
      con.log('loading');
      page.cdn();
      return;
    }
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function() {
      if (
        page.url.split('/')[4] !== undefined &&
        page.url.split('/')[4].length > 0 &&
        page.url.split('/')[6] !== 'filmes' &&
        j
          .$(
            'div.areaTypesList.no-padding > ul > li > a.active > span.totalEps',
          )
          .text()
          .replace(/\D+/g, '') !== '0'
      ) {
        page.handlePage();
      }
    });
  },
};

function getType() {
  if (window.location.href.split('/')[3] === 'watch') {
    var epInfo = j
      .$('.epInfo')
      .text()
      .toLowerCase();
  } else {
    var epInfo = j
      .$('div.areaTypesList.no-padding > ul > li > a.active')
      .text()
      .toLowerCase();
  }
  if (epInfo.indexOf('ova') !== -1) {
    return 'ova';
  } else if (
    epInfo.indexOf('especial') !== -1 ||
    epInfo.indexOf('especiais') !== -1
  ) {
    return 'special';
  } else if (epInfo.indexOf('filme') !== -1) {
    return `movie ${epInfo.replace(/\D+/g, '').replace(/^0+/gm, '')}`;
  } else {
    return 'anime';
  }
}
