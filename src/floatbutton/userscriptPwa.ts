import { Minimal } from '../minimal/minimalClass';

declare let componentHandler: any;

export function pwa() {
  $(document).ready(async function() {
    document.getElementsByTagName('head')[0].onclick = function(e) {
      try {
        componentHandler.upgradeDom();
      } catch (e2) {
        console.log(e2);
        setTimeout(function() {
          componentHandler.upgradeDom();
        }, 500);
      }
    };
    const head = j.$('head');
    api.storage.injectjsResource('material.js', head);
    api.storage.updateDom(head);

    api.storage.injectCssResource('material.css', head);
    api.storage.injectCssResource('materialFont.css', head);

    const minimalObj = new Minimal($('html'));
    minimalObj.fillBase(null);
  });
}
