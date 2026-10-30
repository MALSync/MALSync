import { createApp } from '../../utils/Vue';
import { CorrectionMode, SearchClass as SearchClassExtend } from './searchClass';

import correctionApp from './correctionApp.vue';

export class SearchClass extends SearchClassExtend {
  reloadSync = false;

  protected vueInstance;

  public async openCorrectionCheck(episode?: number, season?: number) {
    // A changed rule set reruns the page
    if (this.getRuleConflict(episode, season)) {
      con.log('Rule conflict');
      if (await this.openCorrection('conflict')) return true;
    }

    if (this.isSimilar()) {
      con.log('similarity', this.state && this.state.similarity.value);
      return false;
    }
    return this.openCorrection('sync').then(() => {
      return this.changed;
    });
  }

  public openCorrection(mode: CorrectionMode = 'default'): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.vueInstance) {
        this.vueInstance.$.appContext.app.unmount();
        if (mode === 'default') {
          resolve(false);
          return;
        }
      }

      const flasmessage = utils.flashm('<div class="ms-shadow"></div>', {
        permanent: true,
        position: 'top',
        type: 'correction',
      });

      this.vueInstance = createApp(correctionApp, flasmessage.find('.ms-shadow').get(0)!, {
        shadowDom: true,
      });
      this.vueInstance.searchClass = this;
      this.vueInstance.mode = mode;
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
