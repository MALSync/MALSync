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
import {Otakustream} from "./Otakustream/main";
import {animepahe} from "./animepahe/main";
import {animeflv} from "./Animeflv/main";
import {Jkanime} from "./Jkanime/main";
import {Vrv} from "./Vrv/main";
import {Proxer} from "./Proxer/main";
import {Animevibe} from "./Animevibe/main";
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

import {pageSearchObj} from "./pageInterface";

export const pages = {
    Kissanime: Kissanime,
    Kissmanga: Kissmanga,
    nineAnime: nineAnime,
    Crunchyroll: Crunchyroll,
    Mangadex: Mangadex,
    Mangarock: Mangarock,
    Gogoanime: Gogoanime,
    Anime4you: Anime4you,
    Branitube: Branitube,
    Turkanime: Turkanime,
    Twistmoe: Twistmoe,
    animeflv: animeflv,
    Jkanime: Jkanime,
    Emby,
    Plex,
    Netflix,
    Otakustream,
    animepahe,
    Vrv,
    Proxer,
    Animevibe,
    Novelplanet,
    WonderfulSubs,
    kawaiifu,
    fourAnime,
    Dreamanimes,
    animeultima,
    Aniflix,
    AnimeDaisuki,
    Animefreak,
    AnimePlanet,
    KickAssAnime,
    RiiE,
    AnimeKisa,
    Wakanim,
    AnimeIndo,
    Shinden,
    Funimation,
    Voiranime,
    DubbedAnime,
    VIZ,
    MangaNelo,
    Mangakakalot,
    NekoSama,
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
      googleSearchDomain: '9anime.to/watch',
      searchUrl: (titleEncoded) => {return 'https://www1.9anime.to/search?keyword='+titleEncoded}
    },
    Otakustream: {
      name: 'Otakustream',
      type: 'anime',
      domain: 'otakustream.tv',
      searchUrl: (titleEncoded) => {return 'https://otakustream.tv/?s='+titleEncoded},
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
      searchUrl: (titleEncoded) => {return 'https://www.google.com/search?q='+titleEncoded+'+site:turkanime.tv/anime/'},
      googleSearchDomain: 'turkanime.tv/anime/'
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
    AniList: {
      name: 'AniList',
      type: 'anime',
      domain: 'anilist.co',
      searchUrl: (titleEncoded) => {return 'https://anilist.co/search/anime?sort=SEARCH_MATCH&search='+titleEncoded}
    },
    Proxeranime: {
      name: 'Proxer',
      type: 'anime',
      domain: 'proxer.me',
      searchUrl: (titleEncoded) => {return 'https://proxer.me/search?s=search&name='+titleEncoded+'&typ=all-anime&tags=&notags=#top'}
    },
    Proxermanga: {
      name: 'Proxer',
      type: 'manga',
      domain: 'proxer.me',
      searchUrl: (titleEncoded) => {return 'https://proxer.me/search?s=search&name='+titleEncoded+'&typ=all-manga&tags=&notags=#top'}
    },
    Novelupdates: {
      name: 'Novel Updates [No Sync]',
      type: 'manga',
      domain: 'www.novelupdates.com',
      searchUrl: (titleEncoded) => {return 'https://www.novelupdates.com/?s='+titleEncoded}
    },
    AniListManga: {
      name: 'AniList',
      type: 'manga',
      domain: 'anilist.co',
      searchUrl: (titleEncoded) => {return 'https://anilist.co/search/manga?sort=SEARCH_MATCH&search='+titleEncoded}
    },
}
