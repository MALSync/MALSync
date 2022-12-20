import { Minimal } from '../_minimal/minimalClass';
import { hideFloatbutton, showFloatbutton } from './init';

let minimalObj: Minimal;

declare let GM_getResourceURL: any;

function createIframe(page) {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('id', 'info-iframe');
  iframe.setAttribute('style', 'height:100%;width:100%;border:0;display:block;');
  iframe.onload = function () {
    const head = j.$('#info-iframe').contents().find('head');

    importAssets(head);

    setTimeout(function () {
      minimalObj = new Minimal(
        j.$('#info-iframe').contents().find('html'),
        () => {
          document.getElementById('info-popup')!.style.display = 'none';
          j.$('.floatbutton').fadeIn();
        },
        () => {
          if (j.$('.modal-content-kal.fullscreen').length) {
            j.$('.modal-content-kal').removeClass('fullscreen');
            // @ts-ignore
            j.$(this).find('i').text('fullscreen');
          } else {
            j.$('.modal-content-kal').addClass('fullscreen');
            // @ts-ignore
            j.$(this).find('i').text('fullscreen_exit');
          }
        },
      );
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
  if (api.settings.get('floatButtonCorrection')) {
    con.log('Open correction');
    page.openCorrectionUi();
  } else {
    con.log('Open miniMAL');
    if (j.$('#info-popup').css('display') === 'none') {
      document.getElementById('info-popup')!.style.display = 'block';
      hideFloatbutton(true);
      if (!j.$('#info-iframe').length) {
        createIframe(page);
      } else if (typeof minimalObj !== 'undefined' && typeof page.singleObj !== 'undefined') {
        minimalObj.fill({ url: page.singleObj.getUrl() }, true);
      }
    } else {
      document.getElementById('info-popup')!.style.display = 'none';
      showFloatbutton();
    }
  }
}

export function importAssets(head) {
  api.storage.injectCssResource(
    '',
    head,
    `
      /* fallback */
      @font-face {
        font-family: 'Material Icons';
        font-style: normal;
        font-weight: 400;
        src: url(${GM_getResourceURL('materialFont.woff2')}) format('woff2');
      }

      .material-icons {
        font-family: 'Material Icons';
        font-weight: normal;
        font-style: normal;
        font-size: 24px;
        line-height: 1;
        letter-spacing: normal;
        text-transform: none;
        display: inline-block;
        white-space: nowrap;
        word-wrap: normal;
        direction: ltr;
        -webkit-font-feature-settings: 'liga';
        -webkit-font-smoothing: antialiased;
      }
    `,
  );
  api.storage.injectCssResource('montserrat.css', head);
}
