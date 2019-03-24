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

    if(this.url.indexOf("?mal-sync=authentication") > -1){
      this.init();
    }

    api.storage.addStyle(require('./style.less').toString());
  }

  init(){
    if(this.url.indexOf("?mal-sync=authentication") > -1){
      this.authentication();
    }
  }

  authentication(){
    $(document).ready(function(){
      $('body').after(`
        <div id="mal-sync-login" style="text-align: center; margin-top: 50px; background-color: white; border: 1px solid lightgrey; padding: 10px; max-width: 600px; margin-left: auto; margin-right: auto;">
          <h1>MAL-Sync</h1>
          <br>
          <p style="text-align: left;">
            To login with Kitsu, you need to enter your account's e-mail and password.</br>
            Your credentials are not stored on your computer or anywhere else. </br>
            They are directly sent to kitsu. Only the returned access token is saved.</br>
          </p>
          <div class="modal-content">
            <input type="email" id="email" placeholder="Email" required>
            <input type="password" id="pass" name="password" placeholder="Password" required>
          </div>
          <div class="form-cta" style="margin-top: 30px;">
            <button class="btn button--primary" type="submit" id="mal-sync-button">
                Login
            </button>
          </div>
        </div>
      `);
      $('#mal-sync-login #mal-sync-button').click(function(){
        $('#mal-sync-login #mal-sync-button').attr("disabled","disabled");
        $.ajax({
          type: "POST",
          url: 'https://kitsu.io/api/oauth/token',
          data: 'grant_type=password&username='+$('#mal-sync-login #email').val()+'&password='+$('#mal-sync-login #pass').val(),
          success: function(result){
            var token = result.access_token;
            con.info('token', token);
          },
          error: function(result){
            try{
              con.error(result);
              $('#mal-sync-login #mal-sync-button').prop("disabled", false);
              if(result.responseJSON.error == 'invalid_grant'){
                utils.flashm('Credentials wrong');
                return;
              }
              utils.flashm(result.responseJSON.error_description);
            }catch(e){
              con.error(e);
              utils.flashm(result.responseText);
            }
          }
        });
      })
    });
  }
}
