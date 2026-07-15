/**
 * Shared helpers for streaming providers whose player UI exposes season/episode
 * metadata as free text (e.g. "T1 Ep.3") and that can optionally be enriched via
 * intercepted fetch responses (e.g. Prime Video, HBO Max).
 *
 * Keeping this logic in one place avoids re-introducing the same bugs (unsafe
 * `Request` handling, fetch wrapper stacking on every SPA navigation, ...) in
 * every provider that needs it.
 */

export interface SeasonEpisode {
  season: number;
  episode: number;
}

/**
 * Parses text in the "T{season} Ep.{episode}" format (e.g. "T1 Ep.3").
 * Returns `undefined` when neither part could be found, so callers can treat
 * the content as a movie in that case.
 */
export function parseSeasonEpisodeText(text: string | undefined | null): SeasonEpisode | undefined {
  if (!text) return undefined;

  const seasonMatch = text.match(/T(\d+)/);
  const episodeMatch = text.match(/Ep\.(\d+)/);

  if (!seasonMatch && !episodeMatch) return undefined;

  return {
    season: seasonMatch ? parseInt(seasonMatch[1]) : 1,
    episode: episodeMatch ? parseInt(episodeMatch[1]) : 1,
  };
}

/**
 * Turns a title into a stable, comparison-safe identifier fragment.
 *
 * Used instead of URL-derived IDs, which some providers regenerate per
 * episode (e.g. HBO Max) rather than keeping them stable per series - relying
 * on those would silently break episode progress tracking.
 */
export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '');
}

let fetchIntercepted = false;

/**
 * Installs a single `window.fetch` wrapper that reports every response back
 * to `onResponse`, without altering the original fetch behavior or its
 * return value.
 *
 * Safe to call on every SPA navigation: the actual override only happens
 * once per content script instance (guarded by a module-level flag), so
 * repeated calls never stack additional wrappers around `fetch` (which would
 * otherwise leak closures and re-process every response once per navigation).
 */
export function interceptFetch(onResponse: (url: string, response: Response) => void): void {
  if (fetchIntercepted) return;
  fetchIntercepted = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async function malSyncInterceptedFetch(
    ...args: Parameters<typeof fetch>
  ): Promise<Response> {
    const response = await originalFetch(...args);

    try {
      const [input] = args;
      let url: string;
      if (typeof input === 'string') {
        url = input;
      } else if (input instanceof Request) {
        ({ url } = input);
      } else {
        url = String(input);
      }
      onResponse(url, response);
    } catch (e) {
      // Interception is best-effort only and must never break the page's own fetch calls.
    }

    return response;
  };
}
