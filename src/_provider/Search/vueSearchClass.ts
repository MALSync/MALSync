import { createApp } from '../../utils/Vue';
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
        this.vueInstance.$.appContext.app.unmount();
        if (!syncMode) {
          resolve(false);
          return;
        }
      }

      const flasmessage = utils.flashm('<div class="ms-shadow"></div>', {
        permanent: true,
        position: 'top',
        type: 'correction',
      });

      this.vueInstance = createApp(correctionApp, flasmessage.find('.ms-shadow').get(0), {
        shadowDom: true,
      });
      this.vueInstance.searchClass = this;
      this.vueInstance.syncMode = syncMode;
      this.vueInstance.unmountFnc = () => {
        resolve(this.changed);
        flasmessage.remove();
        this.vueInstance = undefined;
      };
    });
  }
}
