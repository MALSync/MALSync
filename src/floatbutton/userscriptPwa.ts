import { Minimal } from '../_minimal/minimalClass';

export function pwa() {
  $(document).ready(async function () {
    const head = j.$('head');
    api.storage.injectCssResource('materialFont.css', head);
    api.storage.injectCssResource('montserrat.css', head);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const minimalObj = new Minimal($('html'));
  });
}
