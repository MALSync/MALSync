export function initFloatButton({ page, floatClick }: { page; floatClick; }): void {
  const posLeft = api.settings.get('posLeft');
  const miniMalWidth = api.settings.get('miniMalWidth');
  const miniMalHeight = api.settings.get('miniMalHeight');

  if (!j.$('#info-popup').length) {
    api.storage.addStyle(
      `.modal-content-kal.fullscreen{width: 100% !important;height: 100% !important; bottom: 0 !important;${posLeft}: 0 !important;}\
      .modal-content-kal{-webkit-transition: all 0.5s ease; -moz-transition: all 0.5s ease; -o-transition: all 0.5s ease; transition: all 0.5s ease;}\
      .floatbutton:hover {background-color:rgb(63,81,181) !important;}\
      .floatbutton:hover div {background-color:white;border-color:white;}\
      .floatbutton div {background-color:black;border-color:black;-webkit-transition: all 0.5s ease;-moz-transition: all 0.5s ease;-o-transition: all 0.5s ease;transition: all 0.5s ease;}\
      .floatbutton {\
       z-index: 9999;display: none; position:fixed; bottom:40px; right:40px; border-radius: 50%; font-size: 24px; height: 56px; margin: auto; min-width: 56px; width: 56px; padding: 0; overflow: hidden; background: rgba(158,158,158,.2); box-shadow: 0 1px 1.5px 0 rgba(0,0,0,.12), 0 1px 1px 0 rgba(0,0,0,.24); line-height: normal; border: none;\
       font-weight: 500; text-transform: uppercase; letter-spacing: 0; will-change: box-shadow; transition: box-shadow .2s cubic-bezier(.4,0,1,1),background-color .2s cubic-bezier(.4,0,.2,1),color .2s cubic-bezier(.4,0,.2,1); outline: none; cursor: pointer; text-decoration: none; text-align: center; vertical-align: middle; padding: 16px !important;\
      }\
      .floatbutton.stealth {\
        background: rgba(158,158,158,.03);\
      }\
      .floatbutton.stealth .open-info-popup{\
        visibility: hidden;\
      }\
      .floatbutton.floatHide{\
        visibility: hidden !important;\
      }`,
    );

    // var position = 'width: 80%; height: 70%; position: absolute; top: 15%; left: 10%';
    let position = `max-width: 100%; max-height: 100%; min-width: 500px; min-height: 300px; width: ${miniMalWidth}; height: ${miniMalHeight}; position: absolute; bottom: 0%; ${posLeft}: 0%`; // phone
    // @ts-ignore
    if (j.$(window).width() < 500) {
      position = `width: 100vw; height: 100%; position: absolute; top: 0%; ${posLeft}: 0%`;
    }
    let material =
      '<div class="modal-kal" id="info-popup" style="pointer-events: none;display: none; position: fixed;z-index: 9999;left: 0;top: 0;bottom: 0;width: 100%; height: 100%; background-color: transparent; padding: 0; margin: 0; border: 0;">';
    material += `<div id="modal-content" class="modal-content-kal" Style="pointer-events: all; background-color: #f9f9f9; margin: 0; ${position}">`;
    material += '</div>';
    material += '</div>';
    j.$('body').after(j.html(material));

    let additionalClasses = '';
    if (api.settings.get('floatButtonStealth')) {
      additionalClasses += 'stealth ';
    }
    if (api.settings.get('floatButtonHide')) {
      additionalClasses += 'floatHide ';
    }

    let floatbutton = `<button dir="ltr" class="open-info-popup floatbutton ${additionalClasses}" style="">`;

    if (api.settings.get('floatButtonCorrection')) {
      floatbutton += `
        <i
          class="my-float open-info-popup"
          style="display: flex; height: 8px; transform: rotate(-45deg); margin-left: -7px; margin-right: -5px; pointer-events: none;"
        >
          <div
            style="
              width: 1px;
              margin-left: 2px;
              border-top: 4px solid transparent;
              border-bottom: 4px solid transparent;
              border-right-width: 4px;
              border-right-style: solid;
              background-color: transparent;
            "
          ></div>
          <div style="flex-grow: 1; border-top-left-radius: 2px; border-bottom-left-radius: 2px; margin-left: -1px;"></div>
          <div style="width: 5px; margin-left: 2px; border-top-right-radius: 2px; border-bottom-right-radius: 2px;"></div>
        </i>
      `;
    } else {
      floatbutton +=
        '<i class="my-float open-info-popup" style="margin-top:22px; pointer-events: none;"><div class="open-info-popup" style="width: 100%; height: 4px; margin-bottom: 15%;"></div><div class="open-info-popup" style="width: 100%; height: 4px; margin-bottom: 15%;"></div><div class="open-info-popup" style="width: 100%; height: 4px"></div></i>';
    }

    floatbutton += '</button>';

    j.$('#info-popup').after(j.html(floatbutton));

    if (!api.settings.get('floatButtonCorrection')) showFloatbutton();
    if (api.settings.get('autoCloseMinimal')) j.$('.modal-kal').css('pointer-events', 'initial');

    document.addEventListener('click', function (e) {
      if (!e || !e.target) return;
      if (j.$(e.target).hasClass('open-info-popup')) {
        floatClick(page);
      }
      if (j.$(e.target).hasClass('modal-kal')) {
        document.getElementById('info-popup')!.style.display = 'none';
        showFloatbutton();
      }
    });
  }
}

let floatDebounce;

export function showFloatbutton() {
  clearTimeout(floatDebounce);
  floatDebounce = null;
  j.$('.floatbutton').fadeIn();
}

export function hideFloatbutton(instant = false) {
  if (instant) {
    j.$('.floatbutton').fadeOut();
    return;
  }
  if (!floatDebounce) {
    floatDebounce = setTimeout(() => {
      floatDebounce = null;
      j.$('.floatbutton').fadeOut();
    }, 500);
  }
}
