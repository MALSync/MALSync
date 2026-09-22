/** ISO-639-1 codes supported for the default anime dub language setting. */
export const ANIME_DUB_LANGUAGE_CODES = [
  'en',
  'es',
  'fr',
  'de',
  'pt',
  'it',
  'ru',
  'ar',
] as const;

export type AnimeDubLanguageCode = (typeof ANIME_DUB_LANGUAGE_CODES)[number];

const URL_LANG_PARAM: Record<AnimeDubLanguageCode, string> = {
  en: 'dub',
  es: 'es',
  fr: 'fr',
  de: 'de',
  pt: 'pt',
  it: 'it',
  ru: 'ru',
  ar: 'ar',
};

export function getDefaultAnimeDubLanguage(): string {
  return api.settings.get('defaultAnimeDubLanguage') || '';
}

export function getAnimeDubProgressId(lang: string): string {
  return `${lang}/dub`;
}

export function getAnimeDubUrlLangParam(iso: string): string {
  if (URL_LANG_PARAM[iso as AnimeDubLanguageCode]) {
    return URL_LANG_PARAM[iso as AnimeDubLanguageCode];
  }
  return iso;
}

function isAnimeWatchUrl(url: URL): boolean {
  if (url.searchParams.has('ep')) return true;
  return /\/watch\//i.test(url.pathname);
}

export function applyDefaultAnimeDubLanguage(url: string | undefined): string | undefined {
  if (!url) return url;
  const pref = getDefaultAnimeDubLanguage();
  if (!pref) return url;

  try {
    const parsed = new URL(url, window.location.href);
    if (!isAnimeWatchUrl(parsed)) return url;
    parsed.searchParams.set('lang', getAnimeDubUrlLangParam(pref));
    return parsed.href;
  } catch {
    return url;
  }
}

export function pickPreferredAnimeStreamUrl(urls: string[]): string {
  if (!urls.length) return '';
  const pref = getDefaultAnimeDubLanguage();
  if (!pref) return urls[0];

  const expected = getAnimeDubUrlLangParam(pref);
  const match = urls.find(candidate => {
    try {
      return new URL(candidate, window.location.href).searchParams.get('lang') === expected;
    } catch {
      return false;
    }
  });

  return match || urls[0];
}
