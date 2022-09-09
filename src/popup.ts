import { Minimal } from './_minimal/minimalClass';
import { openMinimal } from './floatbutton/extension';
import { initShark } from './utils/shark';
import { isFirefox } from './utils/general';

initShark();

api.settings.init().then(() => {
  try {
    const mode = $('html').attr('mode');
    con.log('Mode', mode);
    if (mode === 'popup' && api.settings.get('minimalWindow')) {
      openMinimal(function (response) {
        $('html').css('height', '0');
        if (!isFirefox()) {
          window.close();
        }
      });
    }
  } catch (e) {
    con.error(e);
  }

  const minimalObj = new Minimal($('html'));

  checkFill(minimalObj);

  $(window).focus(() => {
    checkFill(minimalObj);
  });
});

function checkFill(minimalObj: Minimal) {
  con.log('CheckFill');
  if (!chrome.tabs) {
    con.error('Can not check for tabs');
    return;
  }
  chrome.tabs.query({ active: true }, tabs => {
    con.m('tabs').log(tabs);
    tabs.forEach(el => {
      chrome.tabs.sendMessage(el.id!, { action: 'TabMalUrl' }, response => {
        if (response && response.url) {
          con.log('Fill', response);
          minimalObj.fill(response);
        }
      });
    });
  });
}
