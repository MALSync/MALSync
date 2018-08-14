import {pages} from "./pages";
import {pageInterface} from "./pageInterface";

export class syncPage{
  page: pageInterface;

  constructor(url){
    this.page = this.getPage(url);
  }

  private getPage(url){
    for (var key in pages) {
      var page = pages[key];
      if( url.indexOf(page.domain.split('//')[1].split('.')[0]+'.') > -1 ){//TODO
        return page;
      }
    }
    return null;
  }

}

