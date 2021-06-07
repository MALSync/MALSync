import { Minimal } from './minimal/minimalClass';
import { openMinimal } from './floatbutton/extension';

declare let componentHandler: any;

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

api.settings.init().then(() => {
  const minimalObj = new Minimal($('html'));

  checkFill(minimalObj);

  $(window).focus(() => {
    checkFill(minimalObj);
  });

  try {
    const mode = $('html').attr('mode');
    con.log('Mode', mode);
    if (mode === 'popup' && api.settings.get('minimalWindow')) {
      openMinimal(function(response) {
        $('html').css('height', '0');
        if (!isFirefox()) {
          window.close();
        }
      });
    }
  } catch (e) {
    con.error(e);
  }
});

function isFirefox() {
  if ($('#Mal-Sync-Popup').css('min-height') === '600px') return true;
  return false;
}

function checkFill(minimalObj) {
  con.log('CheckFill');
  chrome.tabs.query({ active: true }, function(tabs) {
    con.m('tabs').log(tabs);
    tabs.forEach(el => {
      chrome.tabs.sendMessage(el.id!, { action: 'TabMalUrl' }, function(response) {
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
}
