import {searchClass as searchClassExtend} from './searchClass';

import correctionApp from './correctionApp.vue';

import Vue from 'vue';

export class searchClass extends searchClassExtend {

  public openCorrection() {
    var flasmessage = utils.flashm('<div class="shadow"></div>', {permanent: true, position: "top", type: 'correction'});

    var shadow = flasmessage.find('.shadow').get(0)!.attachShadow({mode: 'open'});

    shadow.innerHTML = (`
      <style>
        ${require('!to-string-loader!css-loader!less-loader!./correctionStyle.less').toString()}
      </style>
      <div id="correctionApp"></div>
      `);
    let element = flasmessage.find('.shadow').get(0)!.shadowRoot!.querySelector('#correctionApp')!;
    var minimalVue = new Vue({
      el: element ,
      render: h => h(correctionApp)
    })
  }

}
