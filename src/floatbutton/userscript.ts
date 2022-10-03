import { Minimal } from '../_minimal/minimalClass';

let minimalObj: Minimal;

function createIframe(page) {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('id', 'info-iframe');
  iframe.setAttribute('style', 'height:100%;width:100%;border:0;display:block;');
  iframe.onload = function () {
    const head = j.$('#info-iframe').contents().find('head');

    api.storage.injectCssResource('materialFont.css', head);
    api.storage.injectCssResource('montserrat.css', head);

    setTimeout(function () {
      minimalObj = new Minimal(j.$('#info-iframe').contents().find('html'), () => {
        document.getElementById('info-popup')!.style.display = 'none';
        j.$('.floatbutton').fadeIn();
      });
      if (typeof page !== 'undefined') {
        if (typeof page.singleObj !== 'undefined') {
          minimalObj.fill({ url: page.singleObj.getUrl() }, true);
        }
      }
    }, 200);
  };
  document.getElementById('modal-content')!.appendChild(iframe);
  j.$('#modal-content').append(
    j.html(
      '<div class="kal-tempHeader" style="position:  absolute; width: 100%; height:  103px; background-color: rgb(63,81,181); "></div>',
    ),
  );

  if (!j.$('#info-iframe').length || j.$('#info-iframe').css('display') !== 'block') {
    j.$('#info-popup').remove();
    alert('The miniMAL iframe could not be loaded.\nThis could be caused by an AdBlocker.');
  }
}

export function floatClick(page) {
  con.log('Open miniMAL');
  if (j.$('#info-popup').css('display') === 'none') {
    document.getElementById('info-popup')!.style.display = 'block';
    // fillIframe(url, currentMalData);
    j.$('.floatbutton').fadeOut();
    if (!j.$('#info-iframe').length) {
      createIframe(page);
    } else if (typeof minimalObj !== 'undefined' && typeof page.singleObj !== 'undefined') {
      minimalObj.fill({ url: page.singleObj.getUrl() }, true);
    }
  } else {
    document.getElementById('info-popup')!.style.display = 'none';
    j.$('.floatbutton').fadeIn();
  }
}
