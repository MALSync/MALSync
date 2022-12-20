import { Minimal } from '../_minimal/minimalClass';
import { importAssets } from './userscript';

export function pwa() {
  $(document).ready(async function () {
    const head = j.$('head');
    importAssets(head);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const minimalObj = new Minimal($('html'));
  });
}
