import { pageInterface } from '../pageInterface';

// O site grava temporadas no formato BRASILEIRO („Nª Temporada") — o
// MAL/AniList usa „Nth Season" (entradas separadas por temporada). A
// conversão antes da busca: „Iruma-kun 2ª Temporada" → „Iruma-kun 2nd
// Season" (a entrada certa no MAL). Também LIMPA sufixos de importação
// („(Dublado)", „Todos os Episódios Online", „Animes Online") que
// impediam o MAL de achar o anime.
function toMalTitle(t: string): string {
  const ordinals = ['', '1st', '2nd', '3rd'];
  const ordinalOf = (n: number) => (n >= 1 && n <= 3 ? ordinals[n] : `${n}th`);
  return (
    String(t || '')
      // Sufixos de importação — o MAL não conhece estes textos
      .replace(/\s*\(Dublado\)\s*$/i, '')
      .replace(/\s*-\s*Todos os Epis[óo]dios(?:\s+Online)?\s*$/i, '')
      .replace(/\s*-\s*Animes?\s+Online\s*$/i, '')
      .replace(/\s+Online\s*$/i, '')
      // Temporada BR → Season EN
      .replace(
        /\s+(\d{1,2})ª?\s*Temporada(\s*Final)?\s*$/i,
        (_m, d, fin) => ` ${ordinalOf(Number(d))} Season${fin ? ' Final' : ''}`,
      )
      .replace(/\s+Temporada\s+Final\s*$/i, ' Final Season')
      .replace(/\s+Dublado\s*$/i, '')
      .trim()
  );
}

let nextEpisodeUrl = '';

function seriesIdentifier(url: string): string {
  try {
    const parsed = new URL(url);
    const id =
      parsed.pathname.match(/^\/serie\/(\d+)\/?$/)?.[1] || parsed.searchParams.get('id') || '';
    return /^\d+$/.test(id) ? id : '';
  } catch {
    return '';
  }
}

async function loadNextEpisode(url: string): Promise<void> {
  nextEpisodeUrl = '';
  const sid = j.$('#player-wrap').attr('data-series-id') || '';
  const number = Number(j.$('#player-wrap').attr('data-episode'));
  if (!/^\d+$/.test(sid) || !Number.isSafeInteger(number) || number < 1) return;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    for (let page = 1; page <= 1000; page++) {
      const response = await fetch(
        new URL(`/api/series/${sid}?per_page=200&page=${page}`, url).href,
        { signal: controller.signal },
      );
      if (!response.ok) return;
      const data = await response.json();
      if (!Array.isArray(data.episodes)) return;
      const next = data.episodes
        .filter(
          ep =>
            Number.isSafeInteger(Number(ep.id)) &&
            Number(ep.id) > 0 &&
            Number(ep.episode_number) > number,
        )
        .sort((a, b) => Number(a.episode_number) - Number(b.episode_number))[0];
      if (next) {
        nextEpisodeUrl = new URL(`/episod/${next.id}`, url).href;
        return;
      }
      if (!data.has_more) return;
    }
  } catch {
    /* A falha da lista nao impede a sincronizacao do episodio atual. */
  } finally {
    clearTimeout(timeout);
  }
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
      return sid ? `${new URL(url).origin}/serie/${sid}` : '';
    },
    getEpisode(url) {
      return Number(j.$('#player-wrap').attr('data-episode') || 1);
    },
    nextEpUrl(url) {
      return nextEpisodeUrl;
    },
  },
  overview: {
    getTitle(url) {
      return toMalTitle(j.$('#series-title').first().text().trim());
    },
    getIdentifier(url) {
      return seriesIdentifier(url);
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
        const href = selector.attr('href');
        return href ? new URL(href, window.location.href).href : '';
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
            loadNextEpisode(page.url).finally(handle);
          } else {
            setTimeout(waitForAttrs, 500);
          }
        };
        waitForAttrs();
      } else if (/\/(?:series|serie)(?:\?|\/)/.test(page.url) && seriesIdentifier(page.url)) {
        // o título carrega async — espera:
        // 1. data-loaded (setado pelo site quando o título real chega)
        // 2. OU título não-vazio que NÃO é o placeholder „Carregando…"
        // 3. timeout de 10s — se nada carregar, tenta mesmo assim
        let attempts = 0;
        const waitForTitle = () => {
          const loaded = j.$('#series-title[data-loaded]').length > 0;
          const title = j.$('#series-title').first().text().trim();
          const isReal =
            title && title !== 'Carregando…' && title !== 'Carregando...' && title !== 'Carregando';
          if (loaded || isReal || attempts > 20) {
            handle();
          } else {
            attempts++;
            setTimeout(waitForTitle, 500);
          }
        };
        waitForTitle();
      }
    });
  },
};
