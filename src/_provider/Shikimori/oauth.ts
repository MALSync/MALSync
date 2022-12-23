import { authRequest } from './helper';

export function shikiOauth() {
  $(document).ready(async () => {
    try {
      const tokens = /code=[^&]+/gi.exec(window.location.href);
      if (tokens !== null && typeof tokens[0] !== 'undefined' && tokens[0]) {
        const token = tokens[0].toString().replace(/code=/gi, '');
        con.log('Token Found', token);

        const res = await authRequest({
          code: token,
        });

        await api.settings.set('shikiToken', {
          access_token: res.access_token,
          refresh_token: res.refresh_token,
        });

        $('.card-text.succ').prepend(j.html(api.storage.lang('anilistClass_authentication')));
        $('body').removeClass();
        $('body').addClass('success');

        window.history.replaceState('', '', '/shikimori/oauth');
        return;
      }
      error('No tokens found');
    } catch (e) {
      con.error(e);
      error(e.message);
    }
  });
}

function error(e) {
  $('.card-text').first().text(`Error: ${e}`);
  $('body').removeClass();
  $('body').addClass('noExtension');
}
