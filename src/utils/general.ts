export function urlPart(url:string, part:number){
  try{
      return url.split("/")[part].split("?")[0];
    }catch(e){
      return undefined;
    }

}

export function watching(type: "anime"|"manga"){
  if(type == "manga") return 'Reading';
  return 'Watching';
}

export function planTo(type: "anime"|"manga"){
  if(type == "manga") return 'Plan to Read';
  return 'Plan to Watch';
}

export function getselect(data, name){
    var temp = data.split('name="'+name+'"')[1].split('</select>')[0];
    if(temp.indexOf('selected="selected"') > -1){
        temp = temp.split('<option');
        for (var i = 0; i < temp.length; ++i) {
            if(temp[i].indexOf('selected="selected"') > -1){
                return temp[i].split('value="')[1].split('"')[0];
            }
        }
    }else{
        return '';
    }
}

export function absoluteLink(url, domain) {
  if (typeof url === "undefined") {
    return url;
  }
  if(!url.startsWith("http")) {
    url = domain + url;
  }
  return url;
};

export function getUrlFromTags(tags:string){
  if(/last::[\d\D]+::/.test(tags)){
    return atobURL( tags.split("last::")[1].split("::")[0] );
  }
  if(/malSync::[\d\D]+::/.test(tags)){
    return atobURL( tags.split("malSync::")[1].split("::")[0] );
  }
  return undefined;

  function atobURL( encoded ){
    try{
      return atob( encoded );
    }catch(e){
      return encoded;
    }
  }
}

export function setUrlInTags(url: string, tags: string){
  //if(tagLinks == 0){return current;} TODO
  var addition = "malSync::"+ btoa(url) +"::";
  if(/(last|malSync)::[\d\D]+::/.test(tags)){
      tags = tags.replace(/(last|malSync)::[^\^]*?::/, addition);
  }else{
      tags = tags+','+addition;
  }
  return tags;
}

export async function getMalToKissArray(type, id){
  return new Promise((resolve, reject) => {
    var url = 'https://kissanimelist.firebaseio.com/Data2/Mal'+type+'/'+id+'/Sites.json';
    api.request.xhr('GET', url).then(async (response) => {
      var json = $.parseJSON(response.responseText);

      for(var pageKey in json){
        var page = json[pageKey];

        for(var streamKey in page){
          var stream = page[streamKey];

          var streamUrl = 'https://kissanimelist.firebaseio.com/Data2/'+stream+'/'+encodeURIComponent(streamKey)+'.json';

          var cache = await api.storage.get('MalToKiss/'+stream+'/'+encodeURIComponent(streamKey), null);
          if(typeof(cache) != "undefined"){
            var streamJson = cache;
          }else{
            var streamRespose = await api.request.xhr('GET', streamUrl);
            var streamJson = $.parseJSON(streamRespose.responseText);
            api.storage.set('MalToKiss/'+stream+'/'+encodeURIComponent(streamKey), streamJson);
          }

          json[pageKey][streamKey] = streamJson;

        }
      }

      con.log('Mal2Kiss', json);
      resolve(json);

    });
  });
}

export function getTooltip(text, style = '', direction = 'top'){
  var rNumber = Math.floor((Math.random() * 1000) + 1);
  return '<div id="tt'+rNumber+'" class="icon material-icons" style="font-size:16px; line-height: 0; color: #7f7f7f; padding-bottom: 20px; padding-left: 3px; '+style+'"> &#x1F6C8;</div>\
  <div class="mdl-tooltip mdl-tooltip--'+direction+' mdl-tooltip--large" for="tt'+rNumber+'">'+text+'</div>';
}

//Status: 1 = watching | 2 = completed | 3 = onhold | 4 = dropped | 6 = plan to watch | 7 = all
export function getUserList(status = 1, localListType = 'anime', singleCallback = null, finishCallback = null, fullListCallback = null, continueCall = null, username = null, offset = 0, templist = []){
    con.log('[UserList]', 'username: '+username, 'status: '+status, 'offset: '+offset);
    if(username == null){
        getMalUserName(function(usernameTemp){
            if(usernameTemp == false){
                flashm( "Please log in on <a target='_blank' href='https://myanimelist.net/login.php'>MyAnimeList!<a>" );
            }else{
                getUserList(status, localListType, singleCallback, finishCallback, fullListCallback, continueCall, usernameTemp, offset, templist);
            }
        });
        return;
    }
    var url = 'https://myanimelist.net/'+localListType+'list/'+username+'/load.json?offset='+offset+'&status='+status;
    api.request.xhr('GET', url).then((response) => {
      var data = $.parseJSON(response.responseText);
      if(singleCallback){
        // @ts-ignore
        if(!data.length) singleCallback(false, 0, 0);
        for (var i = 0; i < data.length; i++) {
          // @ts-ignore
          singleCallback(data[i], i+offset+1, data.length+offset);
        }
      }
      if(fullListCallback){
          templist = templist.concat(data);
      }
      if(data.length > 299){
        if(continueCall){
          // @ts-ignore
          continueCall(function(){
            getUserList(status, localListType, singleCallback, finishCallback, fullListCallback, continueCall, username, offset + 300, templist);
          });
        }else{
          getUserList(status, localListType, singleCallback, finishCallback, fullListCallback, continueCall, username, offset + 300, templist);
        }
      }else{
        // @ts-ignore
        if(fullListCallback) fullListCallback(templist);
        // @ts-ignore
        if(finishCallback) finishCallback();
      }

    });
}

export function getMalUserName(callback){
    var url = 'https://myanimelist.net/editlist.php?hideLayout';
    api.request.xhr('GET', url).then((response) => {
      var username = false;
      try{
        username = response.responseText.split('USER_NAME = "')[1].split('"')[0];
      }catch(e){}
      con.log('[Username]', username);
      callback(username);
    });
}

//flashm
export function flashm(text, options?:{error?: boolean, type?: string, permanent?: boolean, hoverInfo?: boolean, position?: "top"|"bottom"}){
    if(!$('#flash-div-top').length){
        initflashm();
    }
    con.log("[Flash] Message:",text);

    var colorF = "#323232";
    if(typeof options !== 'undefined' && typeof options.error !== 'undefined' && options.error){
      var colorF = "#3e0808";
    }

    var flashdiv = '#flash-div-bottom';
    if(typeof options !== 'undefined' && typeof options.position !== 'undefined' && options.position){
      flashdiv = '#flash-div-'+options.position;
    }

    var messClass = "flash";
    if(typeof options !== 'undefined' && typeof options.type !== 'undefined' && options.type){
      var tempClass = "type-"+options.type;
      $(flashdiv+' .'+tempClass)
        .removeClass(tempClass)
        .fadeOut({
          duration: 1000,
          queue: false,
          complete: function() { $(this).remove(); }
        });

      messClass += " "+tempClass;
    }

    var mess = '<div class="'+messClass+'" style="display:none;">\
        <div style="display:table; pointer-events: all; padding: 14px 24px 14px 24px; margin: 0 auto; margin-top: 5px; max-width: 60%; -webkit-border-radius: 20px;-moz-border-radius: 20px;border-radius: 2px;color: white;background:'+colorF+'; ">\
          '+text+'\
        </div>\
      </div>';

    if(typeof options !== 'undefined' && typeof options.hoverInfo !== 'undefined' && options.hoverInfo){
      messClass += " flashinfo";
      mess = '<div class="'+messClass+'" style="display:none; max-height: 5000px; margin-top: -8px;"><div style="display:table; pointer-events: all; margin: 0 auto; margin-top: -2px; max-width: 60%; -webkit-border-radius: 20px;-moz-border-radius: 20px;border-radius: 2px;color: white;background:'+colorF+'; "><div style="max-height: 60vh; overflow-y: auto; padding: 14px 24px 14px 24px;">'+text+'</div></div></div>';
      $('#flashinfo-div').addClass('hover');
      var flashm = $(mess).appendTo('#flashinfo-div')
    }else{
      var flashm = $(mess).appendTo(flashdiv);
    }

    if(typeof options !== 'undefined' && typeof options.permanent !== 'undefined' && options.permanent){
      flashm.slideDown(800);
    }else if(typeof options !== 'undefined' && typeof options.hoverInfo !== 'undefined' && options.hoverInfo){
      flashm.slideDown(800).delay(4000).queue(function() { $('#flashinfo-div').removeClass('hover'); flashm.css('max-height', '8px');});
    }else{
      flashm.slideDown(800).delay(4000).slideUp(800, function() { $(this).remove(); });
    }
    return flashm;
}

export function flashConfirm(message, type, yesCall, cancelCall){
    message = '<div style="text-align: left;">' + message + '</div><div style="display: flex; justify-content: space-around;"><button class="Yes" style="background-color: transparent; border: none; color: rgb(255,64,129);margin-top: 10px; cursor:pointer;">OK</button><button class="Cancel" style="background-color: transparent; border: none; color: rgb(255,64,129);margin-top: 10px; cursor:pointer;">CANCEL</button></div>';
    var flasmessage = flashm(message, {permanent: true, position: "top", type: type});
    flasmessage.find( '.Yes' ).click(function(){
        $(this).parentsUntil('.flash').remove();
        yesCall();
    });
    flasmessage.find( '.Cancel' ).click(function(){
        $(this).parentsUntil('.flash').remove();
        cancelCall();
    });
}

function initflashm(){

    api.storage.addStyle('.flashinfo{\
                    transition: max-height 2s;\
                 }\
                 .flashinfo:hover{\
                    max-height:5000px !important;\
                    z-index: 2147483647;\
                 }\
                 .flashinfo .synopsis{\
                    transition: max-height 2s, max-width 2s ease 2s;\
                 }\
                 .flashinfo:hover .synopsis{\
                    max-height:9999px !important;\
                    max-width: 500px !important;\
                    transition: max-height 2s;\
                 }\
                 #flashinfo-div{\
                  z-index: 2;\
                  transition: 2s;\
                 }\
                 #flashinfo-div:hover, #flashinfo-div.hover{\
                  z-index: 2147483647;\
                 }\
                 \
                 #flash-div-top, #flash-div-bottom, #flashinfo-div{\
                    font-family: "Helvetica","Arial",sans-serif;\
                    color: white;\
                    font-size: 14px;\
                    font-weight: 400;\
                    line-height: 17px;\
                 }\
                 #flash-div-top h2, #flash-div-bottom h2, #flashinfo-div h2{\
                    font-family: "Helvetica","Arial",sans-serif;\
                    color: white;\
                    font-size: 14px;\
                    font-weight: 700;\
                    line-height: 17px;\
                    padding: 0;\
                    margin: 0;\
                 }\
                 #flash-div-top a, #flash-div-bottom a, #flashinfo-div a{\
                    color: #DF6300;\
                 }');

    $('body').after('<div id="flash-div-top" style="text-align: center;pointer-events: none;position: fixed;top:-5px;width:100%;z-index: 2147483647;left: 0;"></div>\
        <div id="flash-div-bottom" style="text-align: center;pointer-events: none;position: fixed;bottom:0px;width:100%;z-index: 2147483647;left: 0;"><div id="flash" style="display:none;  background-color: red;padding: 20px; margin: 0 auto;max-width: 60%;          -webkit-border-radius: 20px;-moz-border-radius: 20px;border-radius: 20px;background:rgba(227,0,0,0.6);"></div></div>\
        <div id="flashinfo-div" style="text-align: center;pointer-events: none;position: fixed;bottom:0px;width:100%;left: 0;">');
}
