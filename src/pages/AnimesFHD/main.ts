import { pageInterface } from '../pageInterface';

export const AnimesFHD: pageInterface = {
  name: 'AnimesFHD',
  domain: 'https://animesfhd.net',
  languages: ['Portuguese'],
  type: 'anime',
  isSyncPage(url) {
    // /episode?id=N (query) e /episod/N (SSR/SEO)
    return /\/(episode|episod)(\?|\/)/.test(url);
  },
  sync: {
    getTitle(url) {
      // data-anime no player-wrap (gravado no load do episódio)
      return j.$('#player-wrap').attr('data-anime') || '';
    },
    getIdentifier(url) {
      // o id da SÉRIE (não do episódio) — o cache/link da MAL é por ele
      return String(j.$('#player-wrap').attr('data-series-id') || '');
    },
    getOverviewUrl(url) {
      const sid = j.$('#player-wrap').attr('data-series-id');
      return sid ? `${AnimesFHD.domain}/series?id=${sid}` : '';
    },
    getEpisode(url) {
      return Number(j.$('#player-wrap').attr('data-episode') || 1);
    },
    nextEpUrl(url) {
      // a lista de episódios da página carrega async — sem next por ora
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return j.$('#series-title').first().text().trim();
    },
    getIdentifier(url) {
      return String(url.split('id=')[1] || '');
    },
    getImage() {
      // a capa do poster — alimenta a caixa de avaliação/estudo da MALSync
      return j.$('#series-poster img').first().attr('src') || '';
    },
    uiSelector(selector) {
      // a caixa entra LOGO ABAIXO dos ser-kpis — mesma fileira, alinhada
      j.$('#series-kpis').first().after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('a.card--ep');
      },
      elementUrl(selector) {
        return selector.attr('href') || '';
      },
      elementEp(selector) {
        return Number(selector.find('.ep-num').first().text()) || 1;
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function () {
      if (AnimesFHD.isSyncPage(page.url)) {
        // os data-attrs são gravados DEPOIS do fetch da API do episódio —
        // espera o player-wrap ficar pronto para o handlePage.
        const waitForAttrs = () => {
          if (j.$('#player-wrap[data-anime]').length) {
            page.handlePage();
          } else {
            setTimeout(waitForAttrs, 500);
          }
        };
        waitForAttrs();
      } else if (/\/series(\?id=|\/)/.test(page.url)) {
        // o título da série também carrega async (fetch do /api) — espera
        const waitForTitle = () => {
          if (j.$('#series-title').length && j.$('#series-title').text().trim()) {
            page.handlePage();
          } else {
            setTimeout(waitForTitle, 500);
          }
        };
        waitForTitle();
      }
    });
  },
};
