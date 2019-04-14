import {storageInterface} from "./storageInterface";
var i18n = require('./../../../assets/_locales/en/messages.json');

declare var GM_setValue: any;
declare var GM_getValue: any;
declare var GM_deleteValue: any;
declare var GM_addStyle: any;
declare var GM_getResourceText: any;
declare var GM_info: any;
declare var GM_listValues: any;

export const userscriptLegacy: storageInterface = {
    async set(key: string, value: string): Promise<void> {
      GM_setValue(key, value);
    },

    async get(key: string): Promise<string | undefined> {
      const value = GM_getValue(key);
      return value;
    },

    async remove(key: string): Promise<void> {
      GM_deleteValue(key);
    },

    async list(): Promise<void> {
      var reverseArray:any = {};
      j.$.each( GM_listValues(), function( index, cache){
        reverseArray[cache] = index;
      });
      return reverseArray;
    },

    async addStyle(css){
      GM_addStyle(css);
    },

    version(){
      return GM_info.script.version;
    },

    lang(selector, args){
      var lEl = i18n[selector];
      var message = lEl.message;
      if(typeof lEl.placeholders !== 'undefined'){
        for(var index in lEl.placeholders) {

          var placeholder = lEl.placeholders[index];
          var pContent = placeholder.content;
          if(typeof args !== 'undefined'){
            for(var argIndex = 0; argIndex < args.length; argIndex++) {
              pContent = pContent.replace("$"+(argIndex + 1), args[argIndex]);
            }
          }

          message = message.replace("$"+index+"$", pContent);
        }
      }
      return message;
    },

    assetUrl(filename){
      return 'https://raw.githubusercontent.com/lolamtisch/MALSync/master/assets/assets/'+filename;
    },

    injectCssResource(res, head){
      head.append(j.$('<style>')
          .attr("rel","stylesheet")
          .attr("type","text/css")
          .html(GM_getResourceText(res)));
    },

    injectjsResource(res, head){
      var s = document.createElement('script');
      s.text = GM_getResourceText(res);
      s.onload = function() {
        // @ts-ignore
        this.remove();
      };
      head.get(0).appendChild(s);
    },

    updateDom(head){
      var s = document.createElement('script');
      s.text = `
        document.getElementsByTagName('head')[0].onclick = function(e){
          try{
            componentHandler.upgradeDom();
          }catch(e){
            console.log(e);
            setTimeout(function(){
              componentHandler.upgradeDom();
            },500);
          }
        }`;
      s.onload = function() {
        // @ts-ignore
        this.remove();
      };
      head.get(0).appendChild(s);
    }
};
