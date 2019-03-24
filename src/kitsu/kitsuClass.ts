//import * as helper from "./../provider/AniList/helper";
import {pageSearch} from './../pages/pages';
//import {entryClass} from "./../provider/AniList/entryClass";
//import {userList} from "./../provider/AniList/userList";

interface detail{
  page: "detail",
  id: number,
  malid: number,
  type: "anime"|"manga"
}

interface bookmarks{
  page: "bookmarks",
  type: "anime"|"manga"
}

export class kitsuClass{
  page: any = null

  constructor(public url:string){
    utils.urlChangeDetect(() => {
      this.url = window.location.href;
      this.init();
    });

    if(this.url.indexOf("access_token=") > -1){
      this.init();
    }

    api.storage.addStyle(require('./style.less').toString());
  }

  init(){
    if(this.url.indexOf("access_token=") > -1){
      this.authentication();
    }
    alert();
  }

  authentication(){
    var tokens = /access_token=[^&]+/gi.exec(this.url);
    if(tokens != null && typeof tokens[0] != 'undefined' && tokens[0]){
      var token = tokens[0].toString().replace(/access_token=/gi, '');
      con.log('Token Found', token);
      api.settings.set('anilistToken', token).then(() => {
        $(document).ready(function(){
          $('.page-content .container').html(`
            <div style="text-align: center; margin-top: 50px; background-color: white; border: 1px solid lightgrey; padding: 10px;">
              <h1>MAL-Sync</h1>
              <br>
              Token saved you can close this page now
            </div>
          `);
        });
      });
    }
  }
}
