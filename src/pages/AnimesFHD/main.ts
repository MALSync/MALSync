import { pageInterface } from '../pageInterface';

// O site grava temporadas no formato BRASILEIRO („Nª Temporada") — o
// MAL/AniList usa „Nth Season" (entradas separadas por temporada). A
// conversão antes da busca: „Iruma-kun 2ª Temporada" → „Iruma-kun 2nd
// Season" (a entrada certa no MAL). Sem isso, TODAS as temporadas do
// site davam „não encontrado".
function toMalTitle(t: string): string {
  const ordinals = ['', '1st', '2nd', '3rd'];
  const ordinalOf = (n: number) => (n >= 1 && n <= 3 ? ordinals[n] : `${n}th`);
  return String(t || '')
    .replace(/\s+(\d{1,2})ª?\s*Temporada(\s*Final)?\s*$/i, (_m, d, fin) =>
      ` ${ordinalOf(Number(d))} Season${fin ? ' Final' : ''}`)
    .replace(/\s+Temporada\s+Final\s*$/i, ' Final Season')
    .trim();
}

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
      return toMalTitle(j.$('#player-wrap').attr('data-anime') || '');
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
      return toMalTitle(j.$('#series-title').first().text().trim());
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
    // GUARD: o MALSync chama handlePage() UMA vez por página. Sem este
    // flag, o mecanismo interno + o waitForTitle duplo injetavam a
    // caixa „Adicionar ao MAL" DUAS VEZES (uma dentro da avaliação).
    let handled = false;
    const handle = () => {
      if (!handled) {
        handled = true;
        page.handlePage();
      }
    };
    j.$(document).ready(function () {
      if (AnimesFHD.isSyncPage(page.url)) {
        const waitForAttrs = () => {
          if (j.$('#player-wrap[data-anime]').length) {
            handle();
          } else {
            setTimeout(waitForAttrs, 500);
          }
        };
        waitForAttrs();
      } else if (/\/series(\?id=|\/)/.test(page.url)) {
        // o título carrega async — espera o data-loaded (setado pelo site
        // quando o título real substitui o placeholder „Carregando…")
        const waitForTitle = () => {
          const loaded = j.$('#series-title[data-loaded]').length > 0;
          if (loaded) {
            handle();
          } else {
            setTimeout(waitForTitle, 500);
          }
        };
        waitForTitle();
      }
    });
  },
};
