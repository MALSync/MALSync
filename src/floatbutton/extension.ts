export function floatClick(page) {
  if (api.settings.get('floatButtonCorrection')) {
    con.log('Open correction');
    page.openCorrectionUi();
  } else {
    con.log('Open miniMAL');

    const width = getPixel(api.settings.get('miniMalWidth'), screen.width);
    const height = getPixel(api.settings.get('miniMalHeight'), screen.height);

    let left;
    if(api.settings.get('posLeft') === 'right') {
      left = screen.width - width;
    }else if(api.settings.get('posLeft') === 'left') {
      left = 1;
    }else{
      left = 0;
    }

    chrome.runtime.sendMessage({ name: 'minimalWindow', height, width, left }, function(
      response,
    ) {
      con.log('Opened');
    });
  }
}

function getPixel(val:string, screenSize: number): number {
  if (/^\d+px$/i.test(val)) {
    return parseInt(val.replace(/px/i, ''));
  } else if (/^\d+%$/i.test(val)) {
    const proz = parseInt(val.replace(/%/i, ''));
    return parseInt((screenSize * (proz/100))+'');
  }
  return NaN;
}