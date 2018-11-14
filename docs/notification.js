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
  var data = [
    {
      title: '0.2.13',
      data: [
        '[FEATURE] Add statuses in related Anime on mal',
        '[FEATURE] Notification Service',
        '[FEATURE] Add userscript mode to webextension',
        '[FEATURE] Add resume watching option #14',
        '[BUGFIX] Missing prediction when no mal-sync tag #20'
      ]
    },
    {
      title: '0.2.12',
      data: [
        '[BUGFIX] Firefox reverting update check to off',
        '[TASK] Extend update check debugging page',
        '[TASK] Save offset values to sync storage',
        '[BUGFIX] Fix miniMAL bookmarks showing wrong episode prediction'
      ]
    },
    {
      title: '0.2.11',
      data: [
        '[FEATURE] Check for new episodes and notify the user'
      ]
    },
    {
      title: '0.2.10',
      data: [
        '[FEATURE] Lazyload miniMAL bookmarks images',
        '[FEATURE] Autoupdate epPrediction on mal detail pages',
        '[TASK] Add update ui for manga in miniMAL',
        '[TASK] Change fail message to update failed',
        '[BUGFIX] Extend next chapter recognition for mangadex',
        '[BUGFIX] Check for mal-sync tags before checking for kal tags'
      ]
    },
    {
      title: '0.2.9',
      data: [
        '[BUGFIX] Episode sync not working',
      ]
    },
    {
      title: '0.2.8',
      data: [
        '[FEATURE] Show link to next episode on overview page',
        '[FEATURE] Add cruchyroll season to every link',
        '[TASK] Replace help icons in miniMAL',
        '[BUGFIX] Force hide continue watching links'
      ]
    },
    {
      title: '0.2.7',
      data: [
        '[FEATURE] Add delay option',
        '[FEATURE] Add option to deactivate the episode prediction',
        '[BUGFIX] Use reading in texts for manga',
        '[BUGFIX] Fix miniMAL popup size for firefox nightly'
      ]
    },
    {
      title: '0.2.6',
      data: [
        '[FEATURE] Switch confirm to flashConfirm',
        '[TASK] Hopefully fix miniMAL not loading in firefox nightly'
      ]
    },
    {
      title: '0.2.5',
      data: [
        '[FEATURE] Add episode prediction',
        '[FEATURE] Enlarge thumbnails on character, people and search pages',
        '[TASK] Add the possibility to deactivate saving urls to MAL tags',
        '[BUGFIX] Fix MAL Search returning no results',
        '[BUGFIX] Fix firefox popup too small'
      ]
    },
    {
      title: '0.2.4',
      data: [
        '[TASK] Bugfixes',
        '[TASK] Set miniMAL popup height to 600px',
        '[FEATURE] Add databaseRequest'
      ]
    },
    {
      title: '0.2.3',
      data: [
        '[BUGFIX] Handle alternative MAL url',
        '[TASK] Update badges'
      ]
    },
    {
      title: '0.2.2',
      data: [
        '[BUGFIX] miniMAL form update not working',
        '[BUGFIX] Crunchyroll video page not working in firefox'
      ]
    },
    {
      title: '0.2.1',
      data: [
        '[BUGFIX] Firefox not loading',
      ]
    },
    {
      title: '0.2.0',
      data: [
        '[FEATURE] Use extensions sync storage',
        '[FEATURE] Support classic animelists',
        '[FEATURE] Add clear cache',
        '[FEATURE] Add Streaming links to miniMAL'
      ]
    },
    {
      title: '0.1.7',
      data: [
        '[FEATURE] Show currently viewed anime in miniMAL popup',
        '[FEATURE] Display bookmarks in miniMAL if no active anime'
      ]
    },
    {
      title: '0.1.6',
      data: [
        '[FEATURE] Add Gogoanime',
        '[FEATURE] Add manual tracking',
        '[TASK] Finish page search',
        '[BUGFIX] Fix mal bookmarks not loading with slow network'
      ]
    },
    {
      title: '0.1.5',
      data: [
        '[FEATURE] Add continue watching links to miniMAL bookmarks',
        '[FEATURE] Add miniMAL information block',
        '[FEATURE] Add miniMAL reviews tab',
        '[FEATURE] Add miniMAL recommendations tab'
      ]
    },
    {
      title: '0.1.4',
      data: [
        '[FEATURE] Add Masteranime',
        '[FEATURE] Add Mangadex',
        '[FEATURE] Add continue watching to miniMAL',
        '[FEATURE] Add ep/status/rating UI to miniMAL'
      ]
    },
    {
      title: '0.1.3',
      data: [
        'Initial Release'
      ]
    }
  ];
  var html = '';
  data.forEach(function(version){
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
