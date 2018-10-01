import {Kissanime} from "./Kissanime/main";
import {Kissmanga} from "./Kissmanga/main";
import {nineAnime} from "./nineAnime/main";
import {Crunchyroll} from "./Crunchyroll/main";
import {Masterani} from "./Masterani/main";
import {Mangadex} from "./Mangadex/main";
import {Gogoanime} from "./Gogoanime/main";

import {pageSearchObj} from "./pageInterface";

export const pages = {
    Kissanime: Kissanime,
    Kissmanga: Kissmanga,
    nineAnime: nineAnime,
    Crunchyroll: Crunchyroll,
    Masterani: Masterani,
    Mangadex: Mangadex,
    Gogoanime: Gogoanime,
};

export const pageSearch:pageSearchObj = {
    Kissanime: {
      name: 'Kissanime',
      type: 'anime',
      domain: 'kissanime.ru',
      searchUrl: (titleEncoded) => {return ''},
      completeSearchTag: (title, linkContent) => {return '<form class="mal_links" target="_blank" action="http://kissanime.ru/Search/Anime" style="display: inline;" id="kissanimeSearch" method="post" _lpchecked="1"><a href="#" class="submitKissanimeSearch" onclick="document.getElementById(\'kissanimeSearch\').submit(); return false;">'+linkContent+'</a><input type="hidden" id="keyword" name="keyword" value="'+title+'"/></form>'}
    },
    Kissmanga: {
      name: 'Kissmanga',
      type: 'manga',
      domain: 'kissmanga.com',
      searchUrl: (titleEncoded) => {return ''},
      completeSearchTag: (title, linkContent) => {return '<form class="mal_links" target="_blank" action="http://kissmanga.com/Search/Manga" style="display: inline;" id="kissanimeSearch" method="post" _lpchecked="1"><a href="#" class="submitKissanimeSearch" onclick="document.getElementById(\'kissanimeSearch\').submit(); return false;">'+linkContent+'</a><input type="hidden" id="keyword" name="keyword" value="'+title+'"/></form>'}
    },
    Crunchyroll: {
      name: 'Crunchyroll',
      type: 'anime',
      domain: 'www.crunchyroll.com',
      searchUrl: (titleEncoded) => {return 'http://www.crunchyroll.com/search?q='+titleEncoded}
    },
    nineAnime: {
      name: '9Anime',
      type: 'anime',
      domain: '9anime.to',
      googleSearchDomain: '9anime.to/watch',
      searchUrl: (titleEncoded) => {return 'https://www1.9anime.to/search?keyword='+titleEncoded}
    },
    MasterAnime: {
      name: 'MasterAnime',
      type: 'anime',
      domain: 'www.masterani.me',
      googleSearchDomain: 'www.masterani.me/anime/info/',
      searchUrl: (titleEncoded) => {return 'https://www.masterani.me/anime?search='+titleEncoded}
    },
    Gogoanime: {
      name: 'Gogoanime',
      type: 'anime',
      domain: 'www.gogoanime.in',
      searchUrl: (titleEncoded) => {return 'http://www3.gogoanime.in/search.html?keyword='+titleEncoded}
    },
    Mangadex: {
      name: 'Mangadex',
      type: 'manga',
      domain: 'mangadex.org',
      searchUrl: (titleEncoded) => {return 'https://mangadex.org/quick_search/'+titleEncoded}
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
