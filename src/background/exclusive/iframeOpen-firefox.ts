import * as utils from '../../utils/general';

declare let browser: any;
export function openInvisiblePage(url: string, id, hiddenTabs) {
  url = `${url + (url.split('?')[1] ? '&' : '?')}mal-sync-background=${id}`;
  if (utils.canHideTabs()) {
    // Firefox
    browser.tabs
      .create({
        url,
        active: false,
      })
      .then(tab => {
        hiddenTabs.push(tab.id);
        browser.tabs.hide(tab.id);
      });
  } else {
    throw 'openInvisiblePage not possible';
  }
}
