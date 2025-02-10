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

      this.keyInterrupt();
    });
  }

  public isCorrectionMenuOpen() {
    return j.$('.type-correction').length > 0;
  }

  keyInterruptRunning = false;

  // Stops keys when correction menu is open. Prevents unwanted behaviour like for example opening the next episode.
  public keyInterrupt() {
    if (this.keyInterruptRunning) return;
    this.keyInterruptRunning = true;
    document.addEventListener('keydown', e => {
      if (this.isCorrectionMenuOpen()) {
        e.stopImmediatePropagation();
        con.info('Correction menu is open, stopped keydown event');
      }
    });
  }
}
