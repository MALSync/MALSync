import Vue from 'vue';
import { SearchClass as SearchClassExtend } from './searchClass';

import correctionApp from './correctionApp.vue';

export class SearchClass extends SearchClassExtend {
  reloadSync = false;

  protected vueInstance;

  public openCorrectionCheck() {
    if (this.state && this.state.similarity && this.state.similarity.same) {
      con.log('similarity', this.state.similarity.value);
      return false;
    }
    return this.openCorrection(true)!.then(() => {
      return this.changed;
    });
  }

  public openCorrection(syncMode = false): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.vueInstance) {
        this.vueInstance.$destroy();
        if (!syncMode) {
          resolve(false);
          return;
        }
      }

      const flasmessage = utils.flashm('<div class="shadow"></div>', {
        permanent: true,
        position: 'top',
        type: 'correction',
      });

      const shadow = flasmessage
        .find('.shadow')
        .get(0)!
        .attachShadow({ mode: 'open' });

      shadow.innerHTML = `
        <style>
          ${j.html(require('!to-string-loader!css-loader!less-loader!./correctionStyle.less').toString())}
        </style>
        <div id="correctionApp"></div>
        `;
      const element = flasmessage
        .find('.shadow')
        .get(0)!
        .shadowRoot!.querySelector('#correctionApp')!;
      this.vueInstance = new Vue({
        el: element,
        data: () => ({
          searchClass: this,
          syncMode,
        }),
        destroyed: () => {
          resolve(this.changed);
          flasmessage.remove();
          this.vueInstance = undefined;
        },
        render: h => h(correctionApp),
      });
    });
  }
}
