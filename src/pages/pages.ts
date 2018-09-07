import {Kissanime} from "./Kissanime/main";
import {Kissmanga} from "./Kissmanga/main";
import {pageSearchObj} from "./pageInterface";

export const pages = {
    Kissanime: Kissanime,
    Kissmanga: Kissmanga
};

export const pageSearch:pageSearchObj = {
    Kissanime: {
      name: '2',
      domain: '',
      googleDomain: '',
      searchUrl: (titleEncoded) => {return ''},
      completeSearchTag: (title) => {return ''}
    }
}
