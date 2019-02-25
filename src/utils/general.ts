declare var browser: any;

export function urlPart(url:string, part:number){
  try{
      return url.split("/")[part].split("?")[0];
    }catch(e){
      return undefined;
    }

}

export function urlParam(url, name){
  var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(url);
  if (results==null){
   return null;
  }
  else{
    return decodeURI(results[1]) || 0;
  }
}

export function favicon(domain){
  if(domain.indexOf('animeheaven') !== -1) return 'http://animeheaven.eu/favicon.ico';
  return 'https://www.google.com/s2/favicons?domain='+domain;
}

export function watching(type: "anime"|"manga"){
  if(type == "manga") return 'Reading';
  return 'Watching';
}

export function planTo(type: "anime"|"manga"){
  if(type == "manga") return 'Plan to Read';
  return 'Plan to Watch';
}

export function episode(type: "anime"|"manga"){
  if(type == "manga") return 'Chapter';
  return 'Episode';
}

export var syncRegex = /(^settings\/.*|^resume\/.*|^continue\/.*|^.*\/Offset$|^updateCheckTime$|^tempVersion$)/

export enum status {
  watching = 1,
  completed = 2,
  onhold = 3,
  dropped = 4,
  planToWatch = 6
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
    if(url.charAt(0) !== '/') url = '/' + url;
    url = domain + url;
  }
  return url;
};

export function urlChangeDetect(callback){
  var currentPage = window.location.href;
  return setInterval(function(){
      if (currentPage != window.location.href){
          currentPage = window.location.href;
          callback();
      }
  }, 1000);
}

export function changeDetect(callback, func){
  var currentPage = func();
  return setInterval(function(){
    var temp = func();
    if (typeof temp != 'undefined' && currentPage != temp){
      currentPage = func();
      callback();
    }
  }, 1000);
}

export function waitUntilTrue(condition, callback){
  var Interval:any = null;
  Interval = setInterval(function(){
      if (condition()){
          clearInterval(Interval);
          callback();
      }
  }, 1000);
  return Interval;
}

export function getUrlFromTags(tags:string){
  if(!api.settings.get('malTags')) return undefined;
  if(/malSync::[\d\D]+::/.test(tags)){
    return atobURL( tags.split("malSync::")[1].split("::")[0] );
  }
  if(/last::[\d\D]+::/.test(tags)){
    return atobURL( tags.split("last::")[1].split("::")[0] );
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
  if(!api.settings.get('malTags')) return tags;
  var addition = "malSync::"+ btoa(url) +"::";
  if(/(last|malSync)::[\d\D]+::/.test(tags)){
      tags = tags.replace(/(last|malSync)::[^\^]*?::/, addition);
  }else{
      tags = tags+','+addition;
  }
  return tags;
}

export async function setResumeWaching(url:string, ep:number, type, id){
  return api.storage.set('resume/'+type+'/'+id, {url: url, ep: ep});
}

export async function getResumeWaching(type, id):Promise<{url:string, ep:number}>{
  //@ts-ignore
  if(!api.settings.get('malResume')) return undefined;
  return api.storage.get('resume/'+type+'/'+id);
}

export async function setContinueWaching(url:string, ep:number, type, id){
  return api.storage.set('continue/'+type+'/'+id, {url: url, ep: ep});
}

export async function getContinueWaching(type, id):Promise<{url:string, ep:number}>{
  //@ts-ignore
  if(!api.settings.get('malContinue')) return undefined;
  return api.storage.get('continue/'+type+'/'+id);
}

export function handleMalImages(url){
  if(url.indexOf('questionmark') !== -1) return api.storage.assetUrl('questionmark.gif');
  return url;
}

export async function getMalToKissArray(type, id){
  return new Promise((resolve, reject) => {
    var url = 'https://kissanimelist.firebaseio.com/Data2/Mal'+type+'/'+id+'/Sites.json';
    api.request.xhr('GET', url).then(async (response) => {
      var json = j.$.parseJSON(response.responseText);

      for(var pageKey in json){
        var page = json[pageKey];

        if(!api.settings.get(pageKey)){
          con.log(pageKey+' is deactivated');
          delete json[pageKey];
          continue;
        }

        for(var streamKey in page){
          var stream = page[streamKey];

          var streamUrl = 'https://kissanimelist.firebaseio.com/Data2/'+stream+'/'+encodeURIComponent(streamKey)+'.json';

          var cache = await api.storage.get('MalToKiss/'+stream+'/'+encodeURIComponent(streamKey), null);
          if(typeof(cache) != "undefined"){
            var streamJson = cache;
          }else{
            var streamRespose = await api.request.xhr('GET', streamUrl);
            var streamJson = j.$.parseJSON(streamRespose.responseText);
            api.storage.set('MalToKiss/'+stream+'/'+encodeURIComponent(streamKey), streamJson);
          }
          if(pageKey == 'Crunchyroll'){
            streamJson['url'] = streamJson['url'] + '?season=' + streamKey;
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
  return '<div id="tt'+rNumber+'" class="icon material-icons" style="font-size:16px; line-height: 0; color: #7f7f7f; padding-bottom: 20px; padding-left: 3px; '+style+'">contact_support</div>\
  <div class="mdl-tooltip mdl-tooltip--'+direction+' mdl-tooltip--large" for="tt'+rNumber+'">'+text+'</div>';
}

export async function epPredictionUI(malid, type = 'anime', callback){

  utils.epPrediction(malid, async function(pre){
    if(!pre) callback(false);
    var updateCheckTime = await api.storage.get("updateCheckTime");
    var aniCache = await api.storage.get('mal/'+malid+'/aniSch');
    var elCache:any = undefined;
    if(typeof updateCheckTime != 'undefined' && updateCheckTime && updateCheckTime != '0'){
      elCache = await api.storage.get('updateCheck/'+type+'/'+malid);
    }
    if(pre === false && typeof elCache == 'undefined') return;
    var UI = {
      tag: '',
      text: '',
      color: '',
      colorStyle: '',
      tagEpisode: false,
      prediction: pre,
      aniCache: aniCache,
      elCache: elCache
    };
    //
    var airing = pre.airing;
    var episode = pre.episode;

    if(typeof aniCache != 'undefined'){
      var timestamp = aniCache.nextEpTime * 1000;
      if(Date.now() < timestamp){
        episode = aniCache.currentEp;
        var delta = (timestamp - Date.now()) / 1000;
        pre.diffDays = Math.floor(delta / 86400);
        delta -= pre.diffDays * 86400;

        pre.diffHours = Math.floor(delta / 3600) % 24;
        delta -= pre.diffHours * 3600;

        pre.diffMinutes = Math.floor(delta / 60) % 60;
        delta -= pre.diffMinutes * 60;
      }else{
        if(Date.now() - timestamp < 1000 * 60 * 60 * 24){
          episode = aniCache.currentEp + 1;
        }
      }
    }

    if(typeof elCache != 'undefined' && typeof elCache.error == 'undefined'){
      if(!elCache.finished){
        airing = true;
      }
      if(elCache.newestEp && elCache.newestEp != '' && typeof elCache.newestEp != 'undefined'){
        episode = elCache.newestEp;
        UI.color = 'red';
      }
    }
    if(UI.color != ''){
      //UI.colorStyle = 'text-decoration: underline overline !important; text-decoration-color: '+UI.color+' !important;'
      UI.colorStyle = 'background-color: #00ff0057;'
    }
    //
    if(airing){
      if(pre.airing){
        UI.text = 'Next episode estimated in '+pre.diffDays+'d '+pre.diffHours+'h '+pre.diffMinutes+'m' ;
      }
      if(episode){
        UI.tag = '<span class="mal-sync-ep-pre" title="'+UI.text+'">[<span style="'+UI.colorStyle+';">'+episode+'</span>]</span>';
        UI.tagEpisode = episode;
      }
    }else{
      if(pre){
        UI.text = '<span class="mal-sync-ep-pre">Airing in '+((pre.diffWeeks*7)+pre.diffDays)+'d '+pre.diffHours+'h '+pre.diffMinutes+'m </span>';
      }
    }
    callback(UI);
  });
}

export function timeDiffToText(delta){
  var text = '';

  delta = delta / 1000;

  var diffDays = Math.floor(delta / 86400);
  delta -= diffDays * 86400;
  if(diffDays){
    text += diffDays+'d ';
  }

  var diffHours = Math.floor(delta / 3600) % 24;
  delta -= diffHours * 3600;
  if(diffHours && diffDays < 2){
    text += diffHours+'h ';
  }

  var diffMinutes = Math.floor(delta / 60) % 60;
  delta -= diffMinutes * 60;
  if(diffMinutes && !diffDays && diffHours < 3){
    text += diffMinutes+'min ';
  }

  return text;
}

export function canHideTabs(){
  if(typeof browser != 'undefined' && typeof browser.tabs.hide != 'undefined'){
    return true;
  }
  return false;
}

export async function epPrediction(malId , callback){
  if(!api.settings.get('epPredictions')) return;
  var timestamp = await api.storage.get('mal/'+malId+'/release');
  if(typeof(timestamp) != "undefined"){
    var airing = 1;
    var episode = 0;
    if(Date.now() < timestamp) airing = 0;

    if(airing){
      var delta = Math.abs(Date.now() - timestamp) / 1000;
    }else{
      var delta = Math.abs(timestamp - Date.now()) / 1000;
    }


    var diffWeeks = Math.floor(delta / (86400 * 7));
    delta -= diffWeeks * (86400 * 7);

    if(airing){
      //We need the time until the week is complete
      delta = (86400 * 7) - delta;
    }

    var diffDays = Math.floor(delta / 86400);
    delta -= diffDays * 86400;

    var diffHours = Math.floor(delta / 3600) % 24;
    delta -= diffHours * 3600;

    var diffMinutes = Math.floor(delta / 60) % 60;
    delta -= diffMinutes * 60;

    if(airing){
      episode = diffWeeks - (new Date().getFullYear() - new Date(timestamp).getFullYear()); //Remove 1 week between years
      episode++;
      if( episode > 50 ){
        episode = 0;
      }
    }

    var maxEp = await api.storage.get('mal/'+malId+'/release');
    if(typeof(maxEp) === "undefined" || episode < maxEp){
      callback({
        timestamp: timestamp,
        airing: airing,
        diffWeeks: diffWeeks,
        diffDays: diffDays,
        diffHours: diffHours,
        diffMinutes: diffMinutes,
        episode: episode
      });
      return;
    }
  }
  callback(false);
}

export function statusTag(status, type, id){
  var info = {
    anime: {
      1:{
        class: 'watching',
        text: 'CW',
        title: 'Watching'
      },
      2:{
        class: 'completed',
        text: 'CMPL',
        title: 'Completed'
      },
      3:{
        class: 'on-hold',
        text: ' HOLD',
        title: 'On-Hold'
      },
      4:{
        class: 'dropped',
        text: 'DROP',
        title: 'Dropped'
      },
      6:{
        class: 'plantowatch',
        text: 'PTW',
        title: 'Plan to Watch'
      }
    },
    manga: {
      1:{
        class: 'reading',
        text: 'CR',
        title: 'Reading'
      },
      2:{
        class: 'completed',
        text: 'CMPL',
        title: 'Completed'
      },
      3:{
        class: 'on-hold',
        text: ' HOLD',
        title: 'On-Hold'
      },
      4:{
        class: 'dropped',
        text: 'DROP',
        title: 'Dropped'
      },
      6:{
        class: 'plantoread',
        text: 'PTR',
        title: 'Plan to Read'
      }
    }
  }

  $.each([1,2,3,4,6], function(i,el){
    info.anime[info.anime[el].title] = info.anime[el];
    info.manga[info.manga[el].title] = info.manga[el];
  });

  if(status){
    var tempInfo = info[type][status];
    return` <a href="https://myanimelist.net/ownlist/${type}/${id}/edit?hideLayout=1" title="${tempInfo.title}" class="Lightbox_AddEdit button_edit ${tempInfo.class}">${tempInfo.text}</a>`;
  }
  return false;
}

export function notifications(url:string, title:string, message:string, iconUrl = ''){
  var messageObj = {
      type: 'basic',
      title: title,
      message: message,
      iconUrl: iconUrl,
   };

  con.log('Notification', url, messageObj );

  api.storage.get('notificationHistory').then((history) => {
    if(typeof history === 'undefined'){
      history = [];
    }
    if (history.length >= 10){
      history.shift();
    }
    history.push({
      url: url,
      title: messageObj.title,
      message: messageObj.message,
      iconUrl: messageObj.iconUrl,
      timestamp: Date.now()
    });
    api.storage.set('notificationHistory', history);
  })

  try{
    return chrome.notifications.create(url, messageObj );
  }catch(e){
    con.error(e);
  }

}

export async function timeCache(key, dataFunction, ttl){
  return new Promise(async (resolve, reject) => {
    var value = await api.storage.get(key);
    if(typeof value !== 'undefined' && new Date().getTime() < value.timestamp){
      resolve(value.data);
      return;
    }
    var result = await dataFunction();
    api.storage.set(key, {data: result, timestamp: new Date().getTime() + ttl}).then(()=>{
      resolve(result);
    });
  });
}

//flashm
export function flashm(text, options?:{error?: boolean, type?: string, permanent?: boolean, hoverInfo?: boolean, position?: "top"|"bottom"}){
    if(!j.$('#flash-div-top').length){
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
      j.$(flashdiv+' .'+tempClass+', #flashinfo-div .'+tempClass)
        .removeClass(tempClass)
        .fadeOut({
          duration: 1000,
          queue: false,
          complete: function() { j.$(this).remove(); }
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
      mess = '<div class="'+messClass+'" style="display:none; max-height: 5000px; overflow: hidden;"><div style="display:table; pointer-events: all; margin: 0 auto; margin-top: -2px; max-width: 60%; -webkit-border-radius: 20px;-moz-border-radius: 20px;border-radius: 2px;color: white;background:'+colorF+'; "><div style="max-height: 60vh; overflow-y: auto; padding: 14px 24px 14px 24px;">'+text+'</div></div></div>';
      j.$('#flashinfo-div').addClass('hover');
      var flashm = j.$(mess).appendTo('#flashinfo-div')
    }else{
      var flashm = j.$(mess).appendTo(flashdiv);
    }

    if(typeof options !== 'undefined' && typeof options.permanent !== 'undefined' && options.permanent){
      flashm.slideDown(800);
    }else if(typeof options !== 'undefined' && typeof options.hoverInfo !== 'undefined' && options.hoverInfo){
      flashm.slideDown(800).delay(4000).queue(function() { j.$('#flashinfo-div').removeClass('hover'); flashm.css('max-height', '8px');});
    }else{
      flashm.slideDown(800).delay(4000).slideUp(800, () => {
        // @ts-ignore
        j.$(this).remove();
      });
    }
    return flashm;
}

export async function flashConfirm(message, type, yesCall = () => {}, cancelCall = () => {}){
  return new Promise(function(resolve, reject) {
    message = '<div style="text-align: center;">' + message + '</div><div style="display: flex; justify-content: space-around;"><button class="Yes" style="background-color: transparent; border: none; color: rgb(255,64,129);margin-top: 10px; cursor:pointer;">OK</button><button class="Cancel" style="background-color: transparent; border: none; color: rgb(255,64,129);margin-top: 10px; cursor:pointer;">CANCEL</button></div>';
    var flasmessage = flashm(message, {permanent: true, position: "top", type: type});
    flasmessage.find( '.Yes' ).click(function(evt){
        j.$(evt.target).parentsUntil('.flash').remove();
        resolve(true);
        yesCall();
    });
    flasmessage.find( '.Cancel' ).click(function(evt){
        j.$(evt.target).parentsUntil('.flash').remove();
        resolve(false);
        cancelCall();
    });
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

    j.$('body').after('<div id="flash-div-top" style="text-align: center;pointer-events: none;position: fixed;top:-5px;width:100%;z-index: 2147483647;left: 0;"></div>\
        <div id="flash-div-bottom" style="text-align: center;pointer-events: none;position: fixed;bottom:0px;width:100%;z-index: 2147483647;left: 0;"><div id="flash" style="display:none;  background-color: red;padding: 20px; margin: 0 auto;max-width: 60%;          -webkit-border-radius: 20px;-moz-border-radius: 20px;border-radius: 20px;background:rgba(227,0,0,0.6);"></div></div>\
        <div id="flashinfo-div" style="text-align: center;pointer-events: none;position: fixed;bottom:0px;width:100%;left: 0;">');
}

var lazyloaded = false;
var lazyimages = new Array();

export function lazyload(doc, scrollElement = '.simplebar-scroll-content'){
  /* lazyload.js (c) Lorenzo Giuliani
   * MIT License (http://www.opensource.org/licenses/mit-license.html)
   *
   * expects a list of:
   * `<img src="blank.gif" data-src="my_image.png" width="600" height="400" class="lazy">`
   */

  function loadImage (el, fn) {
    if(!j.$(el).is(':visible')) return false;
    if(j.$(el).hasClass('lazyBack')){
      j.$(el).css('background-image','url('+el.getAttribute('data-src')+')').removeClass('lazyBack');
    }else{
      var img = new Image()
        , src = el.getAttribute('data-src');
      img.onload = function() {
        if (!! el.parent)
          el.parent.replaceChild(img, el)
        else
          el.src = src;

        fn? fn() : null;
      }
      img.src = src;
    }
  }

  for (var i = 0; i < lazyimages.length; i++) {
    $(lazyimages[i]).addClass('init')
  };

  lazyimages = new Array();
  var query = doc.find('img.lazy.init, .lazyBack.init')
    , processScroll = function(){
        for (var i = 0; i < lazyimages.length; i++) {
          if (utils.elementInViewport(lazyimages[i], 600)) {
            loadImage(lazyimages[i], function () {
              lazyimages.splice(i, i);
            });
          }
          if(!$(lazyimages[i]).length){
            lazyimages.splice(i, i);
          }
        };
      }
    ;
  // Array.prototype.slice.call is not callable under our lovely IE8
  for (var i = 0; i < query.length; i++) {
    lazyimages.push(query[i]);
    $(query[i]).removeClass('init')
  };

  processScroll();

  if(!lazyloaded){
    lazyloaded = true;
    doc.find(scrollElement).scroll(function() {
      processScroll();
    });
  }
}

export function elementInViewport(el, horizontalOffset = 0) {
  var rect = el.getBoundingClientRect()

  return (
     rect.top    >= 0
  && rect.left   >= 0
  // @ts-ignore
  && (rect.top - horizontalOffset) <= (window.innerHeight || document.documentElement.clientHeight)
  )
}
