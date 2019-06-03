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
      searchUrl: (titleEncoded) => {return ''},
      completeSearchTag: (title, linkContent) => {return '<form class="mal_links" target="_blank" action="https://kissanime.ru/Search/Anime" style="display: inline;" id="kissanimeSearch" method="post" _lpchecked="1"><a href="#" class="submitKissanimeSearch" onclick="document.getElementById(\'kissanimeSearch\').submit(); return false;">'+linkContent+'</a><input type="hidden" id="keyword" name="keyword" value="'+title+'"/></form>'}
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
      searchUrl: (titleEncoded) => {return ''},
      completeSearchTag: (title, linkContent) => {return '<form class="mal_links" target="_blank" action="https://kissmanga.com/Search/Manga" style="display: inline;" id="kissanimeSearch" method="post" _lpchecked="1"><a href="#" class="submitKissanimeSearch" onclick="document.getElementById(\'kissanimeSearch\').submit(); return false;">'+linkContent+'</a><input type="hidden" id="keyword" name="keyword" value="'+title+'"/></form>'}
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
    AniListManga: {
      name: 'AniList',
      type: 'manga',
      domain: 'anilist.co',
      searchUrl: (titleEncoded) => {return 'https://anilist.co/search/manga?sort=SEARCH_MATCH&search='+titleEncoded}
    },

}
