import {Kissanime} from "./Kissanime/main";
import {Kissmanga} from "./Kissmanga/main";
import {pageSearchObj} from "./pageInterface";

export const pages = {
    Kissanime: Kissanime,
    Kissmanga: Kissmanga
};

export const pageSearch:pageSearchObj = {
    Kissanime: {
      name: 'Kissanime',
      type: 'anime',
      domain: 'kissanime.ru/Anime',
      searchUrl: (titleEncoded) => {return ''},
      completeSearchTag: (title, linkContent) => {return '<form class="mal_links" target="_blank" action="http://kissanime.ru/Search/Anime" style="display: inline;" id="kissanimeSearch" method="post" _lpchecked="1"><a href="#" class="submitKissanimeSearch" onclick="document.getElementById(\'kissanimeSearch\').submit(); return false;">'+linkContent+'</a><input type="hidden" id="keyword" name="keyword" value="'+title+'"/></form>'}
    },
    crunchyroll: {
      name: 'Crunchyroll',
      type: 'anime',
      domain: 'www.crunchyroll.com',
      searchUrl: (titleEncoded) => {return 'http://www.crunchyroll.com/search?q='+titleEncoded}
    }
}
