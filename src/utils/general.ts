export function urlPart(url:string, part:number){
  try{
      return url.split("/")[part].split("?")[0];
    }catch(e){
      return undefined;
    }

}

export function getMalUrl(identifier: string, title: string, type: string, database: string){
  return firebase();

  function firebase(){
    var url = 'https://kissanimelist.firebaseio.com/Data2/'+database+'/'+encodeURIComponent(titleToDbKey(identifier)).toLowerCase()+'/Mal.json';
    con.log("Firebase", url);
    return api.request.xhr('GET', url).then((response) => {
      con.log("Firebase response",response.responseText);
      if(response.responseText !== 'null' && !(response.responseText.indexOf("error") > -1)){
        if(response.responseText.split('"')[1] == 'Not-Found'){
            return null;
        }
        return 'https://myanimelist.net/'+type+'/'+response.responseText.split('"')[1]+'/'+response.responseText.split('"')[3];;
      }else{
        return false;
      }
    });
  }

  //Helper
  function titleToDbKey(title) {
    if( window.location.href.indexOf("crunchyroll.com") > -1 ){
        return encodeURIComponent(title.toLowerCase().split('#')[0]).replace(/\./g, '%2E');
    }
    return title.toLowerCase().split('#')[0].replace(/\./g, '%2E');
  };
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

/*
    if(permanent){
        $('#flash-div-top').prepend('<div class="flashPerm" style="display:none;"><div style="display:table; pointer-events: all; background-color: red;padding: 14px 24px 14px 24px; margin: 0 auto; margin-top: -2px; max-width: 60%; -webkit-border-radius: 20px;-moz-border-radius: 20px;border-radius: 2px;color: white;background:'+colorF+'; ">'+text+'</div></div>');
        $('.flashPerm').delay(2000).slideDown({duration: 2000, easing: "easeOutElastic"});
    }else{
        if(info){
            $('.flashinfo').removeClass('flashinfo').delay(2000).fadeOut({
                duration: 400,
                queue: false,
                complete: function() { $(this).remove(); }});
            $('#flashinfo-div').addClass('hover').append('<div class="flashinfo" style="display:none; max-height: 5000px; margin-top: -8px;"><div style="display:table; pointer-events: all; background-color: red; margin: 0 auto; margin-top: -2px; max-width: 60%; -webkit-border-radius: 20px;-moz-border-radius: 20px;border-radius: 2px;color: white;background:'+colorF+'; "><div style="max-height: 60vh; overflow-y: auto; padding: 14px 24px 14px 24px;">'+text+'</div></div></div>');
            $('.flashinfo').slideDown(800).delay(4000).queue(function() { $('#flashinfo-div').removeClass('hover'); $(this).css('max-height', '8px');});
        }else{
            $('.flash').removeClass('flash').fadeOut({
                duration: 400,
                queue: false,
                complete: function() { $(this).remove(); }});
            var mess ='<div class="flash" style="display:none;"><div style="display:table; pointer-events: all; background-color: red;padding: 14px 24px 14px 24px; margin: 0 auto; margin-top: 20px; max-width: 60%; -webkit-border-radius: 20px;-moz-border-radius: 20px;border-radius: 2px;color: white;background:'+colorF+'; ">'+text+'</div></div>';
            if($('.flashinfo').length){
                $('.flashinfo').before(mess);
            }else{
                $('#flash-div').append(mess);
            }
            $('.flash').slideDown(800).delay(4000).slideUp(800, function() { $(this).remove(); });
        }
    }*/
}

export function flashConfirm(message, yesCall, cancelCall){
    message = '<div style="text-align: left;">' + message + '</div><div style="display: flex; justify-content: space-around;"><button class="Yes" style="background-color: transparent; border: none; color: rgb(255,64,129);margin-top: 10px; cursor:pointer;">OK</button><button class="Cancel" style="background-color: transparent; border: none; color: rgb(255,64,129);margin-top: 10px; cursor:pointer;">CANCEL</button></div>';
    var flasmessage = flashm(message, {permanent: true, position: "top"});
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
