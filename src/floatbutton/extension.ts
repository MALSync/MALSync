export function floatClick(page) {
  if (api.settings.get('floatButtonCorrection')) {
    con.log('Open correction');
    page.openCorrectionUi();
  } else {
    con.log('Open miniMAL');
    chrome.runtime.sendMessage({ name: 'minimalWindow' }, function(response) {
      con.log('Opened');
    });
  }
}
