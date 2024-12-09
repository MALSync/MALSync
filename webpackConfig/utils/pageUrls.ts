export const myanimelist = {
  match: [
    '*://myanimelist.net/anime/*',
    '*://myanimelist.net/manga/*',
    '*://myanimelist.net/animelist/*',
    '*://myanimelist.net/mangalist/*',
    '*://myanimelist.net/anime.php?id=*',
    '*://myanimelist.net/manga.php?id=*',
    '*://myanimelist.net/character/*',
    '*://myanimelist.net/people/*',
    '*://myanimelist.net/search/*',
  ],
  exclude: [
    '*myanimelist.net/anime/season*',
    '*myanimelist.net/anime/producer*',
    '*myanimelist.net/manga/magazine*',
    '*myanimelist.net/anime/genre*',
    '*myanimelist.net/manga/genre*',
  ],
};
export const anilist = {
  match: ['*://anilist.co/*'],
};
export const kitsu = {
  match: ['*://kitsu.io/*'],
};
export const simkl = {
  match: ['*://simkl.com/*'],
};
export const malsync = {
  match: ['*://malsync.moe/mal/oauth*'],
};
export const malsyncAnilist = {
  match: ['*://malsync.moe/anilist/oauth*'],
};
export const malsyncShiki = {
  match: ['*://malsync.moe/shikimori/oauth*'],
};
export const malsyncPwa = {
  match: ['*://malsync.moe/pwa*'],
};
