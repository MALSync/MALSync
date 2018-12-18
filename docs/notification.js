var tokenSave = null;
var scrollPos = null;

$(document).ready(function() {
  init();
  redirect();
});

function redirect() {
  var path = window.location.pathname.split('/');
  if(path[1] == 'changelog'){
    changelog();
    return;
  }
  home();

}

function init(){
  $('#open-changelog').on('click', function(){
    changelog();
  });
  $('#open-home').on('click', function(){
    home();
  });
  $('.mobile-nav').addClass('allow')
  $('.navbar-toggler').click(function() {
    $('#sidebar-inner').toggleClass("open");
  });
  $('#sidebar-inner').click(function() {
    if ( $(this).hasClass("open") ) {
      $(this).removeClass("open");
    }
  });
  $('#header-inner').show(500);
}

function home(){
  pushHistory('/');
  switchPage('home');
}

function changelog(){
  pushHistory('/changelog');
  var html = '';
  changelogData.forEach(function(version){
    html += `<div class="card change" id="${version.title.replace(/\./g,'-')}">
        <div class="card-header">
          <a href="https://github.com/lolamtisch/MALSync/releases/tag/${version.title}">
            Version ${version.title}
          </a>
        </div>
          <div class="list-group list-group-flush">`;

        version.data.forEach(function(message){
          message = messageHandling(message);
          html += `<div class="list-group-item">
            ${message}
          </div>`
        })
    html += '</div></div>';
  })
  $('#changelog-content').html(html);

  switchPage('changelog');

  if(window.location.hash) {
    var hash = window.location.hash.replace(/\./g,'-');
    $(hash).addClass('border-light');
    $("html, body").animate({ scrollTop: $(hash).offset().top }, 1000);
  }

  function messageHandling(message){
    var issues = /#\d*/g.exec(message);
    if(issues){
      issues.forEach(function(issue){
        message = message.replace(issue,'<a href="https://github.com/lolamtisch/MALSync/issues/'+issue.replace('#','')+'">'+issue+'</a>');
      })
    }

    var badges = /\[(.*?)\]/g.exec(message);
    if(badges){
      badges.forEach(function(badge){
        if(badge[0] != '[') return
        var content = badge.replace(/(^\[|\]$)/g,'');
        var type = 'secondary';
        if(content === 'FEATURE'){
          type = 'info';
        }
        if(content === 'BUGFIX'){
          type = 'warning';
        }
        message = message.replace(badge,'<span class="badge badge-'+type+'" style="float: right; margin-top: 3px;">'+content+'</span>');
      })
    }

    return message;
  }
}

window.addEventListener('popstate', function(event) {
  console.log('popstate fired!', event.state);
  scrollPos = event.state.scroll;
  redirect();
});

//Helper
function switchPage(id){
  $('.page-visibility').css('visibility', 'hidden').css('position', 'absolute')
  $('.page').hide(0);
  $('#'+id).show(0).css('visibility', 'visible').css('position', 'relative');console.log($('#'+id));
  $(window).scrollTop(scrollPos);
}

function pushHistory(path, title){
  if(path.toLowerCase().replace(/\//g, '') === window.location.pathname.toLowerCase().replace(/\//g, '')) return;
  if(!title) title = path;
  //replace
  var data = {};
  data.scroll = $(window).scrollTop();
  console.log(data);
  window.history.replaceState(data, window.location.pathname, window.location.pathname);
  //push
  try{
    history.pushState(data, title, path);
  }catch(e){
    console.error(e);
  }

  scrollPos = null;
}

function randomPostion(){
  return 'background-position: '+Math.floor(Math.random()* 1000)+'px '+Math.floor(Math.random()* 1000)+'px;';
}

function FormatNumberLength(num, length) {
  var r = "" + num;
  while (r.length < length) {
    r = "0" + r;
  }
  return r;
}


//Contributer
contributer();
function contributer(){
  var contr = {
    Developer: [
      {
        name: '『Akkusativ』',
        color: '#992d22',
        image: 'https://cdn.discordapp.com/avatars/357070922030645249/a_439143f99f8554ba2196e908a6c5af99.png?size=256'
      },
    ],
    Contributer: [
      {
        name: 'Roselyn ®「武蔵ちゃん」',
        subText: 'AD Manager',
        color: '#d6680e',
        image: 'https://cdn.discordapp.com/avatars/380463167496650753/1c0e0a4430150b7debcfe8f40762d3bc.png?size=256'
      },
      {
        name: 'ᏆhᎬ ᎶᏒᎬᎪᏆ ᏞuᏒᏦᎬᏒ ᵀᴬᴳ ᴴᴵᴹ',
        color: '#d6680e',
        image: 'https://cdn.discordapp.com/avatars/217589387020599297/6cc800b4b85769c813bbf925201778c4.png?size=256'
      },
    ]
  };

  var html = '';

  for (var group in contr){
    console.log(group);
    html += `<div class="group">${group}</div>`;
    for(var user in contr[group]){
      var userVal = contr[group][user];

      if(typeof userVal.subText != 'undefined' && userVal.subText){
        userVal.subText = `<div class="subtext">${userVal.subText}</div>`;
      }else{
        userVal.subText = '';
      }
      console.log(contr[group][user]);
      html += `
        <div class="user">
          <div class="image align-middle">
            <img src="${userVal.image}">
          </div>
          <div class="text align-middle">
            <div class="name" style="color: ${userVal.color}">
              ${userVal.name}
            </div>
            ${userVal.subText}
          </div>
        </div>
      `;
    }
  }
  $('#contributer .contributer-inner').html(html);
  $('#contributer').addClass('hover');
}
