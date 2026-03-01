import { authRequest } from './queries';

export function shikiOauth() {
  $(() => {
    const tokens = /code=[^&]+/gi.exec(window.location.href);
    if (tokens !== null && typeof tokens[0] !== 'undefined' && tokens[0]) {
      const token = tokens[0].toString().replace(/code=/gi, '');
      con.log('Token Found', token);

      authRequest({
        code: token,
      })
        .then(res => {
          api.settings
            .set('shikiToken', {
              access_token: res.access_token,
              refresh_token: res.refresh_token,
            })
            .then(() => {
              con.info('Shiki OAuth Success');
              success();
              window.history.replaceState('', '', '/shikimori/oauth');
            })
            .catch(e => {
              con.error(e);
              error(e.message);
            });
        })
        .catch(e => {
          con.error(e);
          error(e.message);
        });
    } else {
      error('No tokens found');
    }
  });
}

function error(e) {
  $('.card-text').first().text(`Error: ${e}`);
  $('body').removeClass();
  $('body').addClass('noExtension');
}

function success() {
  $('.card-text.succ').prepend(j.html(api.storage.lang('anilistClass_authentication')));
  $('body').removeClass();
  $('body').addClass('success');
}
