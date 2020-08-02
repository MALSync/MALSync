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
  Kissanime: {
    match: ['*://kissanime.ru/Anime/*', '*://kissanime.to/Anime/*'],
  },
  kissmanga: {
    match: ['*://kissmanga.com/Manga/*'],
  },
  nineAnime: {
    match: [
      '*://*.9anime.to/watch/*',
      '*://*.9anime.is/watch/*',
      '*://*.9anime.ru/watch/*',
      '*://*.9anime.ch/watch/*',
      // '*://*.9anime.nl/watch/*', Not part of 9anime anymore
      '*://*.9anime.live/watch/*',
      '*://*.9anime.one/watch/*',
      '*://*.9anime.page/watch/*',
      '*://*.9anime.video/watch/*',
      '*://*.9anime.life/watch/*',
      '*://*.9anime.love/watch/*',
      '*://*.9anime.tv/watch/*',
    ],
  },
  Crunchyroll: {
    match: ['*://*.crunchyroll.com/*'],
    exclude: [
      '*crunchyroll.com/',
      '*crunchyroll.com',
      '*crunchyroll.com/acct*',
      '*crunchyroll.com/anime-feature/*',
      '*crunchyroll.com/anime-news/*',
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
      '*crunchyroll.com/affiliate_iframeplayer*',
    ],
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
    ],
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
      '*gogoanime*.*/genre/*',
      '*gogoanime*.*/sub-category/*',
      '*animego*.*/',
      '*animego*.*/*.html',
      '*animego*.*/anime-List*',
      '*animego*.*/user*',
      '*animego*.*/genre/*',
      '*animego*.*/sub-category/*',
    ],
  },
  Anime4you: {
    match: ['*://*.anime4you.one/show/1/aid/*'],
  },
  Branitube: {
    match: ['*://*.branitube.net/watch/*', '*://*.branitube.net/animes/*'],
    exclude: ['*://*.branitube.net/animes/filter/*', '*://*.branitube.net/animes/pagina/*'],
  },
  Turkanime: {
    match: [
      '*://*.www.turkanime.tv/video/*',
      '*://*.www.turkanime.tv/anime/*',
      '*://*.www.turkanime.net/video/*',
      '*://*.www.turkanime.net/anime/*',
    ],
  },
  Twistmoe: {
    match: ['*://twist.moe/*'],
  },
  Emby: {
    match: ['*://app.emby.media/*'],
  },
  Plex: {
    match: ['*://app.plex.tv/*'],
  },
  Netflix: {
    match: ['*://www.netflix.com/*'],
  },
  animepahe: {
    match: ['*://animepahe.com/play/*', '*://animepahe.com/anime/*'],
  },
  animeflv: {
    match: ['*://animeflv.net/anime/*', '*://animeflv.net/ver/*'],
  },
  jkanime: {
    match: ['*://jkanime.net/*'],
    exclude: [
      '*://jkanime.net/',
      '*://jkanime.net/letra/*',
      '*://jkanime.net/buscar/*',
      '*://jkanime.net/terminos-condiciones/',
    ],
  },
  Vrv: {
    match: ['*://vrv.co/*'],
  },
  Proxer: {
    match: ['*://proxer.me/*'],
  },
  fourAnime: {
    match: ['*://4anime.to/*'],
  },
  animeultima: {
    match: ['*://*.animeultima.eu/a/*', '*://*.animeultima.to/a/*'],
  },
  Aniflix: {
    match: ['*://*.aniflix.tv/*'],
  },
  AnimeDaisuki: {
    match: ['*://animedaisuki.moe/watch/*', '*://animedaisuki.moe/anime/*'],
  },
  Animefreak: {
    match: ['*://www.animefreak.tv/watch/*'],
  },
  KickAssAnime: {
    match: ['*://*.kickassanime.io/anime/*', '*://*.kickassanime.ru/anime/*', '*://*.kickassanime.rs/anime/*'],
  },
  AnimeKisa: {
    match: ['*://animekisa.tv/*'],
  },
  Wakanim: {
    match: ['*://*.wakanim.tv/*'],
  },
  AnimeIndo: {
    match: ['*://animeindo.moe/*'],
  },
  Shinden: {
    match: ['*://shinden.pl/episode/*', '*://shinden.pl/series/*'],
  },
  Funimation: {
    match: ['*://www.funimation.com/shows/*'],
  },
  voiranime: {
    match: ['*://voiranime.com/*'],
  },
  DubbedAnime: {
    match: ['*://*.dubbedanime.net/*'],
  },
  VIZ: {
    match: ['*://www.viz.com/*'],
  },
  MangaNelo: {
    match: ['*://manganelo.com/*'],
  },
  NekoSama: {
    match: ['*://*.neko-sama.fr/*'],
  },
  AnimeZone: {
    match: ['*://www.animezone.pl/odcinki/*', '*://www.animezone.pl/odcinek/*', '*://www.animezone.pl/anime/*'],
  },
  AnimeOdcinki: {
    match: ['*://anime-odcinki.pl/anime/*'],
  },
  Animeflix: {
    match: ['*://animeflix.io/*'],
  },
  serimanga: {
    match: ['*://serimanga.com/*'],
  },
  mangadenizi: {
    match: ['*://mangadenizi.com/*'],
  },
  moeclip: {
    match: ['*://moeclip.com/*'],
  },
  mangalivre: {
    match: ['*://mangalivre.net/*'],
  },
  tmofans: {
    match: ['*://tmofans.com/*', '*://lectortmo.com/*'],
  },
  unionmangas: {
    match: ['*://unionleitor.top/*', '*://unionmangas.top/*'],
  },
  MangaPlus: {
    match: ['*://mangaplus.shueisha.co.jp/*'],
  },
  JapScan: {
    match: ['*://*.japscan.co/*'],
  },
  MangaKisa: {
    match: ['*://mangakisa.com/*'],
  },
  Goyabu: {
    match: ['*://goyabu.com/*'],
  },
  AnimesVision: {
    match: ['*://*.animesvision.com.br/*', '*://*.animesvision.biz/*'],
  },
  Hulu: {
    match: ['*://www.hulu.com/*'],
  },
  Aniwatch: {
    match: ['*://aniwatch.me/*'],
  },
  Hidive: {
    match: ['*://www.hidive.com/*'],
  },
  JaiminisBox: {
    match: ['*://jaiminisbox.com/reader/series/*', '*://jaiminisbox.com/reader/read/*'],
  },
  FallenAngels: {
    match: ['*://manga.fascans.com/manga/*'],
  },
  animestrue: {
    match: ['*://*.animestrue.net/anime/*/temporada*', '*://*.animestrue.site/anime/*/temporada*'],
  },
  PrimeVideo: {
    match: ['*://*.primevideo.com/*'],
  },
  MangaKatana: {
    match: ['*://mangakatana.com/manga/*'],
  },
  manga4life: {
    match: ['*://manga4life.com/*'],
  },
  bato: {
    match: ['*://bato.to/*'],
  },
  DreamSub: {
    match: ['*://dreamsub.stream/*'],
  },
  MangaPark: {
    match: ['*://mangapark.net/*'],
  },
  AnimesHouse: {
    match: ['*://animeshouse.net/episodio/*', '*://animeshouse.net/filme/*'],
  },
  AnimeXin: {
    match: ['*://animexin.xyz/*'],
  },
  MonosChinos: {
    match: ['*://monoschinos.com/*'],
  },
  AnimeFire: {
    match: ['*://animefire.net/*'],
  },
  OtakuFR: {
    match: ['*://*.otakufr.com/*'],
  },
  Samehadaku: {
    match: ['*://samehadaku.vip/*'],
  },
  TsukiMangas: {
    match: ['*://*.tsukimangas.com/*'],
  },
  mangatx: {
    match: ['*://mangatx.com/*'],
  },
  TRanimeizle: {
    match: ['*://tranimeizle.com/*', '*://www.tranimeizle.com/*'],
  },
  Anihub: {
    match: ['*://anihub.tv/*'],
  },
  AnimeStreamingFR: {
    match: ['*://www.animestreamingfr.fr/anime/*'],
  },
  Scantrad: {
    match: ['*://scantrad.net/*'],
  },
  AnimeId: {
    match: ['*://www.animeid.tv/*'],
  },
  AniMixPlay: {
    match: ['*://animixplay.com/v*'],
  },
  MyAnimeListVideo: {
    match: ['*://myanimelist.net/anime/*/*/episode/*'],
  },
  AnimeSimple: {
    match: ['*://*.animesimple.com/*'],
  },
  AnimeUnity: {
    match: ['*://animeunity.it/anime/*'],
  },
  MangaHere: {
    match: ['*://*.mangahere.cc/manga/*'],
  },
  MangaFox: {
    match: ['*://*.fanfox.net/manga/*', '*://*.mangafox.la/manga/*'],
  },
  JustAnime: {
    match: ['*://justanime.app/*'],
  },
  YayAnimes: {
    match: ['*://yayanimes.net/*'],
  },
  AnimeDesu: {
    match: ['*://animedesu.pl/*'],
  },
  Simplyaweeb: {
    match: ['*://simplyaweeb.com/series/*', '*://simplyaweeb.com/manga/*'],
  },
};
