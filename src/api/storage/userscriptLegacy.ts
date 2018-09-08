import {storageInterface} from "./storageInterface";

declare var GM_setValue: any;
declare var GM_getValue: any;
declare var GM_deleteValue: any;
declare var GM_addStyle: any;
declare var GM_getResourceText: any;
declare var GM_info: any;

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

    async addStyle(css){
      GM_addStyle(css);
    },

    version(){
      return GM_info.script.version;
    },

    assetUrl(filename){
      return 'https://raw.githubusercontent.com/lolamtisch/MALSync/master/assets/assets/'+filename;
    },

    injectCssResource(res, head){
      head.append($('<style>')
          .attr("rel","stylesheet")
          .attr("type","text/css")
          .html(GM_getResourceText(res)));
    },

    injectjsResource(res, head){
      var s = document.createElement('script');
      s.text = GM_getResourceText(res);
      s.onload = function() {
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
          this.remove();
      };
      head.get(0).appendChild(s);
    }
};
