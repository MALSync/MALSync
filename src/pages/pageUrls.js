module.exports = {
  myanimelist: {
    match: [
      '*://myanimelist.net/anime/*',
      '*://myanimelist.net/manga/*',
    ]
  },
  Kissanime: {
    match: [
      '*://kissanime.ru/Anime/*',
      '*://kissanime.to/Anime/*'
    ]
  },
  kissmanga: {
    match: [
      '*://kissmanga.com/Manga/*'
    ]
  },
  nineAnime: {
    match: [
      '*://*.9anime.to/watch/*',
      '*://*.9anime.is/watch/*',
      '*://*.9anime.ru/watch/*',
      '*://*.9anime.ch/watch/*'
    ]
  },
  Crunchyroll:{
    match: [
      '*://*.crunchyroll.com/*'
    ],
    exclude: [
      '*crunchyroll.com/',
      '*crunchyroll.com',
      '*crunchyroll.com/acct*',
      '*crunchyroll.com/anime*',
      '*crunchyroll.com/comics*',
      '*crunchyroll.com/edit*',
      '*crunchyroll.com/email*',
      '*crunchyroll.com/forum*',
      '*crunchyroll.com/home*',
      '*crunchyroll.com/inbox*',
      '*crunchyroll.com/library*',
      '*crunchyroll.com/login*',
      '*crunchyroll.com/manga*',
      '*crunchyroll.com/newprivate*',
      '*crunchyroll.com/news*',
      '*crunchyroll.com/notifications*',
      '*crunchyroll.com/order*',
      '*crunchyroll.com/outbox*',
      '*crunchyroll.com/pm*',
      '*crunchyroll.com/search*',
      '*crunchyroll.com/store*',
      '*crunchyroll.com/user*',
      '*crunchyroll.com/videos*',
    ]
  }
}
