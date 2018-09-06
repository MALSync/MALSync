module.exports = {
  myanimelist: {
    match: [
      '*://myanimelist.net/*'
    ],
    include: [
      '/^https?:\/\/myanimelist.net\/((anime(list)?|manga(list)?)(\.php\?.*id=|\/)|character|people|search)/'
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
  }
}
