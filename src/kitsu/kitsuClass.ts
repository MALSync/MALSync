import * as helper from "./../provider/Kitsu/helper";
import {pageSearch} from './../pages/pages';
import {entryClass} from "./../provider/Kitsu/entryClass";
import {userList} from "./../provider/Kitsu/userList";

interface detail{
  page: "detail",
  id: number,
  malid: number,
  type: "anime"|"manga",
  malObj: undefined
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

  async init(){
    if(this.url.indexOf("?mal-sync=authentication") > -1){
      this.authentication();
    }

    var urlpart = utils.urlPart(this.url, 3);
    if(urlpart == 'anime' || urlpart == 'manga'){
      var malObj = new entryClass(this.url);
      await malObj.init();

      this.page = {
        page: "detail",
        id: malObj.kitsuId,
        malid: malObj.id,
        type: urlpart,
        malObj: malObj,
      }
      con.log('page', this.page);
      this.streamingUI();


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
            api.settings.set('kitsuToken', token).then(() => {
              $('#mal-sync-login').html('<h1>MAL-Sync</h1><br>Token saved you can close this page now')
            });
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

  async streamingUI(){
    con.log('Streaming UI');
    $('#mal-sync-stream-div').remove();
    var malObj = this.page.malObj;

    var streamUrl = malObj.getStreamingUrl();
    if(typeof streamUrl !== 'undefined'){

      $(document).ready(async function(){
        $('.media--title h3').first().after(`
        <div class="data title progress" id="mal-sync-stream-div" style="display: inline-block; position: relative; top: -4px; display: inline;">
          <a class="mal-sync-stream" title="${streamUrl.split('/')[2]}" target="_blank" style="margin: 0 0;" href="${streamUrl}">
            <img src="${utils.favicon(streamUrl.split('/')[2])}">
          </a>
        </div>`);

        var resumeUrlObj = await malObj.getResumeWaching();
        var continueUrlObj = await malObj.getContinueWaching();
        con.log('Resume', resumeUrlObj, 'Continue', continueUrlObj);
        if(typeof continueUrlObj !== 'undefined' && continueUrlObj.ep === (malObj.getEpisode()+1)){
          $('#mal-sync-stream-div').append(
            `<a class="nextStream" title="Continue watching" target="_blank" style="margin: 0 5px 0 0; color: #BABABA;" href="${continueUrlObj.url}">
              <img src="${api.storage.assetUrl('double-arrow-16px.png')}" width="16" height="16">
            </a>`
            );
        }else if(typeof resumeUrlObj !== 'undefined' && resumeUrlObj.ep === malObj.getEpisode()){
          $('#mal-sync-stream-div').append(
            `<a class="resumeStream" title="Resume watching" target="_blank" style="margin: 0 5px 0 0; color: #BABABA;" href="${resumeUrlObj.url}">
              <img src="${api.storage.assetUrl('arrow-16px.png')}" width="16" height="16">
            </a>`
            );
        }

      });
    }
  }
}
