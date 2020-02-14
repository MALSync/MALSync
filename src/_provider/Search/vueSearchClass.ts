import {searchClass as searchClassExtend} from './searchClass';

import correctionApp from './correctionApp.vue';

import Vue from 'vue';

export class searchClass extends searchClassExtend {

  reloadSync = false;

  protected vueInstance;

  public openCorrectionCheck() {
    var tempCurUrl = this.getUrl();
    if(this.state && this.state.similarity && this.state.similarity.same){
      con.log('similarity', this.state.similarity.value);
      return false;
    }
    return this.openCorrection(true)!.then(() => {
      return this.changed;
    });
  }

  public openCorrection(syncMode: boolean = false): Promise<boolean> {
    return new Promise((resolve, reject) => {

      if(this.vueInstance) {
        this.vueInstance.$destroy();
        if(!syncMode) {
          resolve(false);
          return;
        }
      }

      var flasmessage = utils.flashm('<div class="shadow"></div>', {permanent: true, position: "top", type: 'correction'});

      var shadow = flasmessage.find('.shadow').get(0)!.attachShadow({mode: 'open'});

      shadow.innerHTML = (`
        <style>
          ${require('!to-string-loader!css-loader!less-loader!./correctionStyle.less').toString()}
        </style>
        <div id="correctionApp"></div>
        `);
      let element = flasmessage.find('.shadow').get(0)!.shadowRoot!.querySelector('#correctionApp')!;
      this.vueInstance = new Vue({
        el: element ,
        render: h => h(correctionApp),
        data: () => ({
          searchClass: this,
          syncMode: syncMode
        }),
        destroyed: () => {
          resolve(this.changed);
          flasmessage.remove();
          this.vueInstance = undefined;
        }
      })
    });

  }

}
