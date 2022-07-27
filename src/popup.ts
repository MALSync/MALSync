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

function checkFill(minimalObj) {
  con.log('CheckFill');
  /* TODO: Reimplement
  if (!chrome.tabs) {
    con.error('Can not check for tabs');
    return;
  }
  chrome.tabs.query({ active: true }, function (tabs) {
    con.m('tabs').log(tabs);
    tabs.forEach(el => {
      chrome.tabs.sendMessage(el.id!, { action: 'TabMalUrl' }, function (response) {
        setTimeout(() => {
          if (typeof response !== 'undefined' && response.length) {
            minimalObj.fillBase(response);
          } else if ($('html').attr('mode') === 'popup') {
            minimalObj.fillBase(null);
          }
        }, 500);
      });
    });
  });
  */
}
