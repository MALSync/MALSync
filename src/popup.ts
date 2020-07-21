import { minimal } from './minimal/minimalClass';

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
  const minimalObj = new minimal($('html'));

  checkFill(minimalObj);

  window.onfocus = function(){
    checkFill(minimalObj);
  }

  try {
    const mode = $('html').attr('mode');
    con.log('Mode', mode);
    if (mode === 'popup' && api.settings.get('minimalWindow')) {
      chrome.runtime.sendMessage({ name: 'minimalWindow' }, function(response) {
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
  chrome.windows.getLastFocused( { populate: true, windowTypes: ['normal'] }, ( windowEl ) => {
    con.m('Focus').log(windowEl);
    if(windowEl.tabs && windowEl.tabs.length) {
      windowEl.tabs.some(function(el) {
        if (el.active) {
          // @ts-ignore
          chrome.tabs.sendMessage(el.id, { action: 'TabMalUrl' }, function(response) {
            setTimeout(() => {
              if (typeof response !== 'undefined') {
                minimalObj.fillBase(response);
              } else {
                minimalObj.fillBase(null);
              }
            }, 500);
          });
          return true;
        }
        return false;
      });
    }
  });
}
