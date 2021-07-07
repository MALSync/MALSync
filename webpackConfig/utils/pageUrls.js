module.exports = {
  myanimelist: {
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
  },
  anilist: {
    match: ['*://anilist.co/*'],
  },
  kitsu: {
    match: ['*://kitsu.io/*'],
  },
  simkl: {
    match: ['*://simkl.com/*'],
  },
  malsync: {
    match: ['*://malsync.moe/mal/oauth*'],
  },
  malsyncPwa: {
    match: ['*://malsync.moe/pwa*'],
  },
};
