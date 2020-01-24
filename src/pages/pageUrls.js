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
      '*://myanimelist.net/search/*'
    ],
    exclude: [
      '*myanimelist.net/anime/season*'
    ]
  },
  anilist: {
    match: [
      '*://anilist.co/*'
    ]
  },
  kitsu: {
    match: [
      '*://kitsu.io/*'
    ]
  },
  simkl: {
    match: [
      '*://simkl.com/*'
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
      '*://*.9anime.ch/watch/*',
      '*://*.9anime.nl/watch/*',
      '*://*.9anime.live/watch/*',
      '*://*.9anime.one/watch/*',
      '*://*.9anime.page/watch/*',
      '*://*.9anime.video/watch/*',
      '*://*.9anime.life/watch/*',
      '*://*.9anime.love/watch/*',
      '*://*.9anime.tv/watch/*',
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
      '*crunchyroll.com/affiliate_iframeplayer*'
    ]
  },
  Mangadex: {
    match: [
      '*://*.mangadex.org/manga/*',
      '*://*.mangadex.org/title/*',
      '*://*.mangadex.org/chapter/*',
      //
      '*://*.mangadex.cc/manga/*',
      '*://*.mangadex.cc/title/*',
      '*://*.mangadex.cc/chapter/*',
    ]
  },
  Gogoanime: {
    match: [
      '*://*.gogoanime.tv/*',
      '*://*.gogoanime.io/*',
      '*://*.gogoanime.in/*',
      '*://*.gogoanime.se/*',
      '*://*.gogoanime.sh/*',
      '*://*.gogoanime.video/*',
      '*://*.gogoanime.movie/*',
      '*://*.gogoanimes.co/*',
      '*://*.animego.to/*',
    ],
    exclude: [
      '*gogoanime*.*/',
      '*gogoanime*.*/*.html',
      '*gogoanime*.*/anime-List*',
      '*gogoanime*.*/user*',
      '*animego*.*/',
      '*animego*.*/*.html',
      '*animego*.*/anime-List*',
      '*animego*.*/user*',
    ]
  },
  Anime4you: {
    match: [
      '*://*.anime4you.one/show/1/aid/*',
    ]
  },
  Branitube: {
    match: [
      '*://*.branitube.net/watch/*',
      '*://*.branitube.net/animes/*'
    ]
  },
  Turkanime: {
    match: [
      '*://*.www.turkanime.tv/video/*',
      '*://*.www.turkanime.tv/anime/*',
      '*://*.www.turkanime.net/video/*',
      '*://*.www.turkanime.net/anime/*'
    ]
  },
  Twistmoe: {
    match: [
      '*://twist.moe/*'
    ]
  },
  Emby: {
    match: [
      '*://app.emby.media/*'
    ]
  },
  Plex: {
    match: [
      '*://app.plex.tv/*',
    ]
  },
  Netflix: {
    match: [
      '*://www.netflix.com/*'
    ]
  },
  animepahe: {
    match: [
      '*://animepahe.com/play/*',
      '*://animepahe.com/anime/*'
    ]
  },
  animeflv: {
    match: [
      '*://animeflv.net/anime/*',
      '*://animeflv.net/ver/*',
    ]
  },
  jkanime: {
    match: [
      '*://jkanime.net/*',
    ],
    exclude: [
      '*://jkanime.net/',
      '*://jkanime.net/letra/*',
      '*://jkanime.net/buscar/*',
      '*://jkanime.net/terminos-condiciones/',
    ]
  },
  Vrv: {
    match: [
      '*://vrv.co/*',
    ]
  },
  Proxer: {
    match: [
      '*://proxer.me/*',
    ],
  },
  Novelplanet: {
    match: [
      '*://novelplanet.com/Novel/*',
    ],
  },
  kawaiifu: {
    match: [
      '*://kawaiifu.com/season/*',
      '*://kawaiifu.com/dub/*',
      '*://kawaiifu.com/tv-series/*',
      '*://kawaiifu.com/anime-movies/*',
      '*://bestwea.stream/season/*',
      '*://bestwea.stream/dub/*',
      '*://bestwea.stream/tv-series/*',
      '*://bestwea.stream/anime-movies/*',
      '*://animestuffs.com/season/*',
      '*://animestuffs.com/dub/*',
      '*://animestuffs.com/tv-series/*',
      '*://animestuffs.com/anime-movies/*',
    ],
  },
  fourAnime: {
    match: [
      '*://4anime.to/*',
    ],
  },
  Dreamanimes: {
    match: [
      '*://www.dreamanimes.com.br/*'
    ],
  },
  animeultima: {
    match: [
      '*://*.animeultima.eu/a/*'
    ],
  },
  Aniflix: {
    match: [
      '*://*.aniflix.tv/*',
    ],
  },
  AnimeDaisuki: {
    match: [
      '*://animedaisuki.moe/watch/*',
      '*://animedaisuki.moe/anime/*'
    ],
  },
  Animefreak: {
    match: [
      '*://www.animefreak.tv/watch/*'
    ],
  },
  AnimePlanet: {
    match: [
      '*://www.anime-planet.com/anime/*'
    ],
  },
  KickAssAnime: {
    match: [
      '*://*.kickassanime.io/anime/*',
      '*://*.kickassanime.ru/anime/*',
      '*://*.kickassanime.rs/anime/*'
    ],
  },
  RiiE: {
    match: [
      '*://www.riie.net/*'
    ],
  },
  AnimeKisa: {
    match: [
      '*://animekisa.tv/*'
    ],
  },
  Wakanim: {
    match: [
      '*://*.wakanim.tv/*'
    ],
  },
  AnimeIndo: {
    match: [
      '*://animeindo.moe/*'
    ],
  },
  Shinden: {
    match: [
      '*://shinden.pl/episode/*',
      '*://shinden.pl/series/*'
    ],
  },
  Funimation: {
    match: [
      '*://www.funimation.com/shows/*'
    ],
  },
  voiranime: {
    match: [
      '*://voiranime.com/*'
    ]
  },
  DubbedAnime: {
    match: [
      '*://*.dubbedanime.net/*'
    ]
  },
  VIZ: {
    match: [
      '*://www.viz.com/*'
    ]
  },
  MangaNelo: {
    match: [
      '*://manganelo.com/*'
    ]
  },
  Mangakakalot: {
    match: [
      '*://mangakakalot.com/*'
    ]
  },
  NekoSama: {
    match: [
      '*://*.neko-sama.fr/*'
    ]
  },
  AnimeZone: {
    match: [
      '*://www.animezone.pl/odcinki/*',
      '*://www.animezone.pl/odcinek/*'
    ]
  },
  AnimeOdcinki: {
    match: [
      '*://anime-odcinki.pl/anime/*'
    ]
  },
  Animeflix: {
    match: [
      '*://animeflix.io/*'
    ]
  },
  AnimeFever: {
    match: [
      '*://*.animefever.tv/*'
    ]
  },
  serimanga: {
    match: [
      '*://serimanga.com/*'
    ]
  },
  mangadenizi: {
    match: [
      '*://mangadenizi.com/*'
    ]
  },
  moeclip: {
    match: [
      '*://moeclip.com/*'
    ]
  },
  mangalivre: {
    match: [
      '*://mangalivre.com/*'
    ]
  },
  tmofans: {
    match: [
      '*://tmofans.com/*'
    ]
  },
  unionleitor: {
    match: [
      '*://unionleitor.top/*',
      '*://unionmangas.top/*'
    ]
  },
  myAnime: {
    match: [
      '*://myanime.moe/*'
    ]
  },
  MangaPlus: {
    match: [
      '*://mangaplus.shueisha.co.jp/*'
    ]
  },
  JapScan: {
    match: [
      '*://*.japscan.co/*'
    ]
  },
  MangaKisa: {
    match: [
      '*://mangakisa.com/*'
    ]
  },
  Goyabu: {
    match: [
      '*://goyabu.com/*'
    ]
  },
  AnimesVision: {
    match: [
      '*://*.animesvision.com.br/*'
    ]
  },
  Hulu: {
    match: [
      '*://www.hulu.com/*'
    ]
  },
  Aniwatch: {
    match: [
      '*://aniwatch.me/*'
    ]
  },
  Hidive: {
    match: [
     '*://www.hidive.com/*'
    ]
  },
  JaiminisBox: {
    match: [
     '*://jaiminisbox.com/reader/series/*',
     '*://jaiminisbox.com/reader/read/*'
    ]
  }
};
