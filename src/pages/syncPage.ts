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
      if( url.indexOf(utils.urlPart(page.domain, 2).split('.').slice(-2, -1)[0] +'.') > -1 ){
        return page;
      }
    }
    return null;
  }

}

