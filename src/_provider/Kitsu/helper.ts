export function translateList(aniStatus, malStatus: null | number = null) {
  const list = {
    current: 1,
    planned: 6,
    completed: 2,
    dropped: 4,
    on_hold: 3,
  };
  if (malStatus !== null) {
    return Object.keys(list).find(key => list[key] === malStatus);
  }
  return list[aniStatus];
}

export function getTitle(titles, canonicalTitle) {
  switch (api.settings.get('kitsuOptions').titleLanguagePreference) {
    case 'english':
      var title = titles.en;
      break;
    case 'romanized':
      var title = titles.en_jp;
      break;
    case 'canonical':
    default:
      var title = canonicalTitle;
  }

  if (typeof title === 'undefined' || !title) title = titles.en;
  if (typeof title === 'undefined' || !title) title = titles.en_jp;
  if (typeof title === 'undefined' || !title) title = titles.ja_jp;
  if (typeof title === 'undefined' || !title) {
    const keys = Object.keys(titles);
    if (!keys.length) {
      return 'No Title';
    }
    title = titles[keys[0]];
  }

  return title;
}

export function getCacheKey(id, kitsuId) {
  if (Number.isNaN(id) || !id) {
    return `kitsu:${kitsuId}`;
  }
  return id;
}
