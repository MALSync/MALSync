import { pageInterface } from '../pageInterface';

export const Branitube: pageInterface = {
  name: 'Branitube',
  domain: 'https://www.branitube.net',
  languages: ['Portuguese'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3] === 'video') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      if (getType() !== 'anime') {
        return `${j.$('.nomeAnime').text()} ${getType()}`;
      }
      return j.$('.nomeAnime').text();
    },
    getIdentifier(url) {
      return `${j.$('.nomeAnime').data('anid')}?${getType().replace(/\s/gm, '')}`;
    },
    getOverviewUrl(url) {
      const tempUrl = Branitube.domain + (j.$('div.buttonEpisodes > a').attr('href') || '');
      if (getType() === 'anime') {
        return tempUrl;
      }
      if (getType() === 'ova') {
        return `${tempUrl}/ovas`;
      }
      if (getType() === 'special') {
        return `${tempUrl}/especiais`;
      }
      return `${tempUrl}/filmes`;
    },
    getEpisode(url) {
      if (getType().indexOf('movie') === -1) {
        return Number(
          j
            .$('.epInfo')
            .text()
            .replace(/\D+/g, ''),
        );
      }
      return 1;
    },
    nextEpUrl(url) {
      if (
        getType().indexOf('movie') === -1 &&
        j.$('.cplPl').attr('data-npl') &&
        j.$('.cplPl').attr('data-cpl') &&
        j.$('.cplPl').attr('data-npltype') &&
        j.$('.cplPl').attr('data-cpl') === j.$('.cplPl').attr('data-npltype')
      ) {
        return `${Branitube.domain}/video/${j.$('.cplPl').attr('data-npl')}/${url.split('/')[5]}`;
      }
      return '';
    },
    getMalUrl(provider) {
      let malid;
      if (getType() === 'anime') {
        malid = j.$('.nomeAnime').attr('data-anmalid');
        if (!malid || malid === '0') {
          malid = j.$('.epInfo').attr('data-epmalid');
        }
      } else {
        malid = j.$('.epInfo').attr('data-epmalid');
      }
      if (malid && malid !== '0') {
        return `https://myanimelist.net/anime/${malid}`;
      }
      return false;
    },
  },
  overview: {
    getTitle(url) {
      if (getType() !== 'anime') {
        return `${j.$('div.animeInfos > ul > li.largeSize').text()} ${getType()}`;
      }
      return j.$('div.animeInfos > ul > li.largeSize').text();
    },
    getIdentifier(url) {
      return `${url.split('/')[4]}?${getType()}`;
    },
    uiSelector(selector) {
      j.$('div.areaEpsList')
        .first()
        .prepend(j.html(`<div class="animeResult" style="margin:8px;"> ${selector}</div>`));
    },
    getMalUrl(provider) {
      let malid;
      if (getType() === 'anime') {
        malid = j.$('div.animeInfos > ul > li.largeSize').attr('data-malid');
      }
      if (malid && malid !== '0') {
        return `https://myanimelist.net/anime/${malid}`;
      }
      return false;
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.areaEpsList > .getTotalShowingEp > .item-ep > div.area-ep');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('a')
            .first()
            .attr('href'),
          Branitube.domain,
        );
      },
      elementEp(selector) {
        return utils
          .getBaseText(selector.find('div.infos-bottom > div.ep-info > div.anime-content').first())
          .replace(/\D+/g, '');
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (
        page.url.split('/')[4] !== undefined &&
        page.url.split('/')[4].length > 0 &&
        page.url.split('/')[6] !== 'filmes' &&
        j
          .$('div.areaTypesList.no-padding > ul > li > a.active > span.totalEps')
          .text()
          .replace(/\D+/g, '') !== '0'
      ) {
        page.handlePage();
      }
    });
  },
};

function getType() {
  let epInfo;
  if (window.location.href.split('/')[3] === 'video') {
    epInfo = j
      .$('.epInfo')
      .text()
      .toLowerCase();
  } else {
    epInfo = j
      .$('div.areaTypesList.no-padding > ul > li > a.active')
      .text()
      .toLowerCase();
  }
  if (epInfo.indexOf('ova') !== -1) {
    return 'ova';
  }
  if (epInfo.indexOf('especial') !== -1 || epInfo.indexOf('especiais') !== -1) {
    return 'special';
  }
  if (epInfo.indexOf('filme') !== -1) {
    return `movie ${epInfo.replace(/\D+/g, '').replace(/^0+/gm, '')}`;
  }
  return 'anime';
}
