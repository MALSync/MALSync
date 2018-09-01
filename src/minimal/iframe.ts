import {minimal} from "./minimalClass";

export function createIframe(){
  if( !($('#info-popup').length) ){
    //TEMP
    var posLeft = 'left';
    var miniMalWidth = '30%';
    var miniMalHeight = '30%';
    //TEMP END
    //var position = 'width: 80%; height: 70%; position: absolute; top: 15%; left: 10%';
    var position = 'max-width: 100%; max-height: 100%; min-width: 500px; min-height: 300px; width: '+miniMalWidth+'; height: '+miniMalHeight+'; position: absolute; bottom: 0%; '+ posLeft +': 0%';//phone
    /*if($(window).width() < 500){TODO
      position = 'width: 100vw; height: 100%; position: absolute; top: 0%; '+ posLeft +': 0%';
    }*/
    var material = '<dialog class="modal-kal" id="info-popup" style="pointer-events: none;display: none; position: fixed;z-index: 9999;left: 0;top: 0;bottom: 0;width: 100%; height: 100%; background-color: transparent; padding: 0; margin: 0; border: 0;">';
    material += '<div id="modal-content" class="modal-content-kal" Style="pointer-events: all; background-color: #f9f9f9; margin: 0; '+position+'">';
    material += '</div>';
    material += '</dialog>';
    $('body').after(material);

    api.storage.addStyle('.modal-content-kal.fullscreen{width: 100% !important;height: 100% !important; bottom: 0 !important;'+ posLeft +': 0 !important;}\
           .modal-content-kal{-webkit-transition: all 0.5s ease; -moz-transition: all 0.5s ease; -o-transition: all 0.5s ease; transition: all 0.5s ease;}\
           .floatbutton:hover {background-color:rgb(63,81,181);}\
           .floatbutton:hover div {background-color:white;}\
           .floatbutton div {background-color:black;-webkit-transition: all 0.5s ease;-moz-transition: all 0.5s ease;-o-transition: all 0.5s ease;transition: all 0.5s ease;}\
           .floatbutton {\
            z-index: 9999;display: none; position:fixed; bottom:40px; right:40px; border-radius: 50%; font-size: 24px; height: 56px; margin: auto; min-width: 56px; width: 56px; padding: 0; overflow: hidden; background: rgba(158,158,158,.2); box-shadow: 0 1px 1.5px 0 rgba(0,0,0,.12), 0 1px 1px 0 rgba(0,0,0,.24); line-height: normal; border: none;\
            font-weight: 500; text-transform: uppercase; letter-spacing: 0; will-change: box-shadow; transition: box-shadow .2s cubic-bezier(.4,0,1,1),background-color .2s cubic-bezier(.4,0,.2,1),color .2s cubic-bezier(.4,0,.2,1); outline: none; cursor: pointer; text-decoration: none; text-align: center; vertical-align: middle; padding: 16px;\
           }\
           .mdl-button{\
            background: #3f51b5; color: #fff;box-shadow: 0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.2), 0 1px 5px 0 rgba(0,0,0,.12);\
            border: none; border-radius: 2px;\
           }');

    var iframe = document.createElement('iframe');
    iframe.setAttribute("id", "info-iframe");
    iframe.setAttribute("style", "height:100%;width:100%;border:0;");
    iframe.onload = function() {
      /*executejs(GM_getResourceText("materialjs"));*/
      /*executejs(GM_getResourceText("simpleBarjs"));*/
      var head = $("#info-iframe").contents().find("head");
      head.append('<style>#material .mdl-card__supporting-text{width: initial} .mdl-layout__header .mdl-textfield__label:after{background-color: red !important;}</style>');
      head.append('<style>\
              .alternative-list .mdl-list{\
              max-width: 100%;\
              margin: 0;\
              padding: 0;\
              }\
              .alternative-list .mdl-list__item{\
              height: auto;\
              }\
              .alternative-list .mdl-list__item-primary-content{\
              height: auto !important;\
              }\
              .alternative-list .mdl-list__item-primary-content a{\
              display: block;\
              }\
              .alternative-list .mdl-list__item-text-body{\
              height: auto !important;\
              }\
              \
              .coverinfo .mdl-chip{\
              height: auto;\
              }\
              .coverinfo .mdl-chip .mdl-chip__text{\
              white-space: normal;\
              line-height: 24px;\
              }\
              \
              \
              .mdl-layout__content::-webkit-scrollbar{\
              width: 10px !important;\
              background-color: #F5F5F5;\
              }\
              .mdl-layout__content::-webkit-scrollbar-thumb{\
              background-color: #c1c1c1 !important;\
              }\
              .simplebar-track{\
              width: 10px !important;\
              background-color: #F5F5F5;\
              }\
              .simplebar-scrollbar{\
              background-color: #c1c1c1 !important;\
              }\
              .simplebar-track.horizontal{\
              display: none;\
              }\
              \
              .simplebar-scrollbar{\
              border-radius: 0px !important;\
              right: 0 !important;\
              width: 100% !important;\
              opacity: 1 !important;\
              }\
              .simplebar-scrollbar.visible:before{\
              display: none;\
              }\
              .simplebar-content{\
              margin-right: -7px !important;\
              }\
              .simplebar-track{\
              margin-top: -2px;\
              margin-bottom: -2px;\
              }\
              a{\
              text-decoration: none;\
              }\
              .mdl-layout__tab-panel a:hover{\
              text-decoration: underline;\
              }\
              .mdl-cell{\
              background-color: #fefefe;\
              }\
              \
              #material.simple-header .mdl-layout__header .mdl-layout__tab-bar-container{\
              display: none;\
              }\
              \
              .newEp {\
                position: absolute;\
                background-color: #dedede;\
                height: 25px;\
                width: 29px;\
                top: 3px;\
                right: -4px;\
                background-repeat: no-repeat;\
                background-position: 4px 3px;\
                background-image: url(https://github.com/google/material-design-icons/blob/master/social/1x_web/ic_notifications_none_black_18dp.png?raw=true);\
              }\
            </style>');

      api.storage.injectCssResource('materialCSS', head);
      api.storage.injectCssResource('materialFont', head);
      api.storage.injectCssResource('simpleBarCSS', head);

      var floatbutton = '<button class="open-info-popup floatbutton" style="">';
      floatbutton += '<i class="my-float" style="margin-top:22px;"><div style="width: 100%; height: 4px; margin-bottom: 15%;"></div><div style="width: 100%; height: 4px; margin-bottom: 15%;"></div><div style="width: 100%; height: 4px"></div></i></button>';
      $('#info-popup').after(floatbutton);
      /*if(miniMalButtonLate != ''){
        miniMalButton(miniMalButtonLate);
      }*/

      //TEMP
        $(".open-info-popup").unbind('click').show().click( function(){
            if($('#info-popup').css('display') == 'none'){
                document.getElementById('info-popup')!.style.display = "block";
                //fillIframe(url, currentMalData);
                $('.floatbutton').fadeOut();
            }else{
                document.getElementById('info-popup')!.style.display = "none";
                $('.floatbutton').fadeIn();
            }
        });


        var minimalObj = new minimal($("#info-iframe").contents().find('html'));
      //TEMP

    };
    document.getElementById("modal-content")!.appendChild(iframe);
    $("#modal-content").append('<div class="kal-tempHeader" style="position:  absolute; width: 100%; height:  103px; background-color: rgb(63,81,181); "></div>');
  }
}
