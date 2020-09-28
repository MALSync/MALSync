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
  nineAnime: {
    match: [
      '*://*.9anime.to/watch/*',
      '*://*.9anime.ru/watch/*',
      '*://*.9anime.live/watch/*',
      '*://*.9anime.one/watch/*',
      '*://*.9anime.page/watch/*',
      '*://*.9anime.video/watch/*',
      '*://*.9anime.life/watch/*',
      '*://*.9anime.love/watch/*',
      '*://*.9anime.tv/watch/*',
      '*://*.9anime.app/watch/*',
      '*://*.9anime.at/watch/*',
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
      '*://*.gogoanime.so/*',
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
    match: [
      '*://animepahe.com/play/*',
      '*://animepahe.com/anime/*',
      '*://animepahe.ru/play/*',
      '*://animepahe.ru/anime/*',
      '*://animepahe.org/play/*',
      '*://animepahe.org/anime/*',
    ],
  },
  animeflv: {
    match: ['*://*.animeflv.net/anime/*', '*://*.animeflv.net/ver/*'],
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
    exclude: [
      '*://www.animezone.pl/anime/lista*',
      '*://www.animezone.pl/anime/sezony*',
      '*://www.animezone.pl/anime/ranking*',
      '*://www.animezone.pl/anime/nadchodzace*',
      '*://www.animezone.pl/anime/premiery*',
      '*://www.animezone.pl/anime/filmy*',
    ],
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
    match: ['*://*.japscan.se/*'],
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
    match: ['*://*.manga4life.com/*'],
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
    match: ['*://animixplay.to/v*', '*://animixplay.com/v*'],
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
  Animevibe: {
    match: ['*://animevibe.tv/ani/*'],
  },
  WuxiaWorld: {
    match: ['*://wuxiaworld.site/novel/*'],
  },
  AnimeOnDemand: {
    match: ['*://www.anime-on-demand.de/anime/*'],
  },
  EdelgardeScans: {
    match: ['*://edelgardescans.com/*'],
  },
  HatigarmScanz: {
    match: ['*://hatigarmscanz.net/*'],
  },
  KKJScans: {
    match: ['*://kkjscans.co/*'],
  },
  LeviatanScans: {
    match: ['*://leviatanscans.com/*'],
  },
  MethodScans: {
    match: ['*://methodscans.com/*'],
  },
  NonamesScans: {
    match: ['*://the-nonames.com/*'],
  },
  ReaperScans: {
    match: ['*://reaperscans.com/*'],
  },
  SecretScans: {
    match: ['*://secretscans.co/*'],
  },
  SKScans: {
    match: ['*://skscans.com/*'],
  },
  ZeroScans: {
    match: ['*://zeroscans.com/*'],
  },
  DeathTollScans: {
    match: ['*://reader.deathtollscans.net/*'],
  },
  HelveticaScans: {
    match: ['*://helveticascans.com/r*'],
  },
  KireiCake: {
    match: ['*://reader.kireicake.com/*'],
  },
  SenseScans: {
    match: ['*://sensescans.com/reader*'],
  },
  ManhuaPlus: {
    match: ['*://manhuaplus.com/manga*'],
  },
  Readm: {
    match: ['*://readm.org/manga/*'],
  },
  tioanime: {
    match: ['*://tioanime.com/anime/*', '*://tioanime.com/ver/*'],
  },
  YugenAnime: {
    match: ['*://yugenani.me/*'],
  },
  MangaSee: {
    match: ['*://*.mangasee123.com/manga*', '*://*.mangasee123.com/read-online*'],
  },
  AnimeTribes: {
    match: ['*://animetribes.ru/watch/*'],
  },
  Okanime: {
    match: ['*://www.okanime.com/animes/*', '*://www.okanime.com/movies/*'],
  },
  BSTO: {
    match: ['*://bs.to/serie/*'],
  },
};
