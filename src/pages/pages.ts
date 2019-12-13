import {Kissanime} from "./Kissanime/main";
import {Kissmanga} from "./Kissmanga/main";
import {nineAnime} from "./nineAnime/main";
import {Crunchyroll} from "./Crunchyroll/main";
import {Mangadex} from "./Mangadex/main";
import {Mangarock} from "./Mangarock/main";
import {Gogoanime} from "./Gogoanime/main";
import {Anime4you} from "./Anime4you/main";
import {Branitube} from "./Branitube/main";
import {Turkanime} from "./Turkanime/main";
import {Twistmoe} from "./Twistmoe/main";
import {Emby} from "./Emby/main";
import {Plex} from "./Plex/main";
import {Netflix} from "./Netflix/main";
import {animepahe} from "./animepahe/main";
import {animeflv} from "./Animeflv/main";
import {Jkanime} from "./Jkanime/main";
import {Vrv} from "./Vrv/main";
import {Proxer} from "./Proxer/main";
import {Novelplanet} from "./Novelplanet/main";
import {WonderfulSubs} from "./WonderfulSubs/main";
import {kawaiifu} from "./kawaiifu/main";
import {fourAnime} from "./fourAnime/main";
import {Dreamanimes} from "./Dreamanimes/main";
import {animeultima} from "./animeultima/main";
import {Aniflix} from "./Aniflix/main";
import {AnimeDaisuki} from "./AnimeDaisuki/main";
import {Animefreak} from "./Animefreak/main";
import {AnimePlanet} from "./AnimePlanet/main";
import {KickAssAnime} from "./KickAssAnime/main";
import {RiiE} from "./RiiE/main";
import {AnimeKisa} from "./AnimeKisa/main";
import {Wakanim} from "./Wakanim/main";
import {AnimeIndo} from "./AnimeIndo/main";
import {Shinden} from "./Shinden/main";
import {Funimation} from "./Funimation/main";
import {Voiranime} from "./Voiranime/main";
import {DubbedAnime} from "./DubbedAnime/main";
import {VIZ} from "./VIZ/main";
import {MangaNelo} from "./MangaNelo/main";
import {Mangakakalot} from "./Mangakakalot/main";
import {NekoSama} from "./NekoSama/main";
import {AnimeZone} from "./AnimeZone/main";
import {AnimeOdcinki} from "./AnimeOdcinki/main";
import {Animeflix} from "./Animeflix/main";
import {AnimeFever} from "./AnimeFever/main";
import {serimanga} from "./serimanga/main";
import {mangadenizi} from "./mangadenizi/main";
import {moeclip} from "./moeclip/main";
import {mangalivre} from "./mangalivre/main";
import {tmofans} from "./tmofans/main";
import {unionleitor} from "./unionleitor/main";
import {myAnime} from "./myAnime/main";
import {MangaPlus} from "./MangaPlus/main";
import {JapScan} from "./JapScan/main";
import {MangaKisa} from "./MangaKisa/main";
import {Goyabu} from "./Goyabu/main";
import {AnimesVision} from "./AnimesVision/main";
import {Hulu} from "./Hulu/main";
import {Aniwatch} from "./Aniwatch/main";
 
import {pageSearchObj} from "./pageInterface";

export const pages = {
    Kissanime,
    Kissmanga,
    nineAnime,
    Crunchyroll,
    Vrv,
    Mangadex,
    Mangarock,
    Gogoanime,
    Twistmoe,
    Anime4you,
    Branitube,
    Turkanime,
    animepahe,
    Netflix,
    animeflv,
    Jkanime,
    Proxer,
    Wakanim,
    WonderfulSubs,
    kawaiifu,
    Emby,
    Plex,
    Novelplanet,
    fourAnime,
    Dreamanimes,
    animeultima,
    Aniflix,
    Animefreak,
    AnimeDaisuki,
    AnimePlanet,
    KickAssAnime,
    RiiE,
    AnimeKisa,
    AnimeIndo,
    Shinden,
    Funimation,
    Voiranime,
    DubbedAnime,
    MangaNelo,
    Mangakakalot,
    VIZ,
    NekoSama,
    AnimeOdcinki,
    AnimeZone,
    Animeflix,
    AnimeFever,
    serimanga,
    mangadenizi,
    moeclip,
    mangalivre,
    tmofans,
    unionleitor,
    myAnime,
    MangaPlus,
    JapScan,
    MangaKisa,
    Goyabu,
    AnimesVision,
    Hulu,
    Aniwatch
};

export const pageSearch:pageSearchObj = {
    Crunchyroll: {
      name: 'Crunchyroll',
      type: 'anime',
      domain: 'www.crunchyroll.com',
      searchUrl: (titleEncoded) => {return 'http://www.crunchyroll.com/search?q='+titleEncoded}
    },
    Netflix: {
      name: 'Netflix',
      type: 'anime',
      domain: 'www.netflix.com',
      searchUrl: (titleEncoded) => {return 'https://www.netflix.com/search?q='+titleEncoded}
    },
    nineAnime: {
      name: '9Anime',
      type: 'anime',
      domain: '9anime.to',
      searchUrl: (titleEncoded) => {return 'https://www1.9anime.to/search?keyword='+titleEncoded}
    },
    Kissanime: {
      name: 'Kissanime',
      type: 'anime',
      domain: 'kissanime.ru',
      searchUrl: (titleEncoded) => {return 'https://kissanime.ru/Search/Anime?keyword='+titleEncoded},
    },
    Gogoanime: {
      name: 'Gogoanime',
      type: 'anime',
      domain: 'www.gogoanime.in',
      searchUrl: (titleEncoded) => {return 'http://gogoanimes.co/search.html?keyword='+titleEncoded}
    },
    Turkanime: {
      name: 'Turkanime',
      type: 'anime',
      domain: 'www.turkanime.tv/',
      searchUrl: (titleEncoded) => {return 'https://www.google.com/search?q='+titleEncoded+'+site:turkanime.tv/anime/ OR site:turkanime.net/anime/'}
    },
    animeflv: {
      name: 'animeflv',
      type: 'anime',
      domain: 'animeflv.net',
      searchUrl: (titleEncoded) => {return 'https://animeflv.net/browse?q='+titleEncoded}
    },
    Jkanime: {
      name: 'Jkanime',
      type: 'anime',
      domain: 'jkanime.net',
      searchUrl: (titleEncoded) => {return 'https://jkanime.net/buscar/'+titleEncoded+'/1/'}
    },
    Mangadex: {
      name: 'Mangadex',
      type: 'manga',
      domain: 'mangadex.org',
      searchUrl: (titleEncoded) => {return 'https://mangadex.org/quick_search/'+titleEncoded}
    },
    Mangarock: {
      name: 'Mangarock',
      type: 'manga',
      domain: 'mangarock.com',
      searchUrl: (titleEncoded) => {return 'https://mangarock.com/search?q='+titleEncoded}
    },
    Kissmanga: {
      name: 'Kissmanga',
      type: 'manga',
      domain: 'kissmanga.com',
      searchUrl: (titleEncoded) => {return 'https://kissmanga.com/Search/Manga?keyword='+titleEncoded},
    },
    Novelplanet: {
      name: 'Novelplanet',
      type: 'manga',
      domain: 'novelplanet.com',
      searchUrl: (titleEncoded) => {return 'https://novelplanet.com/NovelList?name='+titleEncoded}
    },
    Proxeranime: {
      name: 'Proxer',
      type: 'anime',
      domain: 'proxer.me',
      searchUrl: (titleEncoded) => {return 'https://proxer.me/search?s=search&name='+titleEncoded+'&typ=all-anime&tags=&notags=#top'}
    },
    Animeflix: {
      name: 'Animeflix',
      type: 'anime',
      domain: 'animeflix.io',
      searchUrl: (titleEncoded) => {return 'https://www.google.com/search?q='+titleEncoded+'+site:animeflix.io/shows/'}
    },
    Proxermanga: {
      name: 'Proxer',
      type: 'manga',
      domain: 'proxer.me',
      searchUrl: (titleEncoded) => {return 'https://proxer.me/search?s=search&name='+titleEncoded+'&typ=all-manga&tags=&notags=#top'}
    },
    MangaUpdates: {
      name: 'Mangaupdates',
      type: 'manga',
      domain: 'mangaupdates.com',
      searchUrl: (titleEncoded) => {return 'https://www.mangaupdates.com/series.html?search='+titleEncoded}
    },
    Novelupdates: {
      name: 'Novel Updates [No Sync]',
      type: 'manga',
      domain: 'www.novelupdates.com',
      searchUrl: (titleEncoded) => {return 'https://www.novelupdates.com/?s='+titleEncoded}
    },
    Doujinshi: {
      name: 'Doujinshi',
      type: 'manga',
      domain: 'www.doujinshi.org',
      searchUrl: (titleEncoded) => {return 'https://www.doujinshi.org/search/simple/?T=objects&sn='+titleEncoded}
    },
    AniDb: {
      name: 'aniDB',
      type: 'anime',
      domain: 'anidb.net',
      searchUrl: (titleEncoded) => {return 'https://anidb.net/anime/?do.search=1&adb.search='+titleEncoded}
    },
    AniList: {
      name: 'AniList',
      type: 'anime',
      domain: 'anilist.co',
      searchUrl: (titleEncoded) => {return 'https://anilist.co/search/anime?sort=SEARCH_MATCH&search='+titleEncoded}
    },
    AniListManga: {
      name: 'AniList',
      type: 'manga',
      domain: 'anilist.co',
      searchUrl: (titleEncoded) => {return 'https://anilist.co/search/manga?sort=SEARCH_MATCH&search='+titleEncoded}
    },
    Kitsu: {
      name: 'Kitsu',
      type: 'anime',
      domain: 'kitsu.io',
      searchUrl: (titleEncoded) => {return 'https://kitsu.io/anime?text='+titleEncoded}
    },
    KitsuManga: {
      name: 'Kitsu',
      type: 'manga',
      domain: 'kitsu.io',
      searchUrl: (titleEncoded) => {return 'https://kitsu.io/manga?text='+titleEncoded}
    },
    SimklAnime: {
      name: 'Simkl',
      type: 'anime',
      domain: 'simkl.com',
      searchUrl: (titleEncoded) => {return 'https://simkl.com/search/?type=anime&q='+titleEncoded}
    },
    MALManga: {
      name: 'MyAnimeList',
      type: 'manga',
      domain: 'myanimelist.net',
      searchUrl: (titleEncoded) => {return 'https://myanimelist.net/manga.php?q='+titleEncoded}
    },
    MALAnime: {
      name: 'MyAnimeList',
      type: 'anime',
      domain: 'myanimelist.net',
      searchUrl: (titleEncoded) => {return 'https://myanimelist.net/anime.php?q='+titleEncoded}
    },
}
