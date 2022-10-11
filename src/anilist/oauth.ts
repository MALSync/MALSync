export function anilistOauth() {
  $(document).ready(async () => {
    try {
      const tokens = /access_token=[^&]+/gi.exec(window.location.href);
      if (tokens !== null && typeof tokens[0] !== 'undefined' && tokens[0]) {
        const token = tokens[0].toString().replace(/access_token=/gi, '');
        con.log('Token Found', token);

        await api.settings.set('anilistToken', token);

        $('.card-text.succ').prepend(j.html(api.storage.lang('anilistClass_authentication')));
        $('body').removeClass();
        $('body').addClass('success');

        window.history.replaceState('', '', '/anilist/oauth');
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
