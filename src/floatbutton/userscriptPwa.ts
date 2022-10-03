import { Minimal } from '../_minimal/minimalClass';

export function pwa() {
  $(document).ready(async function () {
    const head = j.$('head');
    api.storage.injectCssResource('materialFont.css', head);
    api.storage.injectCssResource('montserrat.css', head);

    const minimalObj = new Minimal($('html'));
  });
}
