const clientId = __MAL_SYNC_KEYS__.mangabaka.id;
const redirectUri = 'https://malsync.moe/mangabaka/oauth';
const clientSecret = __MAL_SYNC_KEYS__.mangabaka.secret;

export function mangabakaOauth() {
  $(document).ready(async function () {
    if (window.location.href.includes('code=')) {
      try {
        await getRefreshToken();
      } catch (e) {
        console.error(e);
        $('.card-text').first().text(`Error: ${e}`);
        $('body').removeClass();
        $('body').addClass('noExtension');
      }
      return;
    }
    generateUrl();
  });
}

function generateUrl() {
  const challenge = generateRandomString(50);
  const state = generateRandomString(10);

  const scopes = ['library.read', 'library.write', 'openid', 'profile'];
  sessionStorage.setItem(state, challenge);
  const url = `https://mangabaka.dev/auth/oauth2/authorize?response_type=code&client_id=${clientId}&scope=${scopes.join('+')}&redirect_uri=${redirectUri}&state=${state}&code_challenge=${challenge}&code_challenge_method=plain`;
  $('.card-text.succ').prepend(
    j.html(`<a class="btn btn-outline-light" href="${url}">Start Authentication</a>`),
  );
  $('body').removeClass();
  $('body').addClass('success');
}

function generateRandomString(length: number): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// TODO: Validate the ID Token
async function getRefreshToken() {
  const code = utils.urlParam(window.location.href, 'code');
  const state = utils.urlParam(window.location.href, 'state');
  window.history.replaceState('', '', '/mangabaka/oauth');
  if (!state || !code) throw 'Url wrong';
  const challenge = sessionStorage.getItem(state);
  if (!challenge) throw 'No challenge found';
  return api.request
    .xhr('POST', {
      url: 'https://mangabaka.dev/auth/oauth2/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: `&client_id=${clientId}&client_secret=${clientSecret}&grant_type=authorization_code&code=${code}&code_verifier=${challenge}&redirect_uri=${redirectUri}`,
    })
    .then(res => JSON.parse(res.responseText))
    .then(json => {
      if (json && json.id_token && json.access_token) {
        api.settings.set('mangabakaToken', json.access_token);
        api.settings.set('mangabakaIdToken', json.id_token);
        $('.card-text.succ').prepend(j.html(api.storage.lang('anilistClass_authentication')));
        $('body').removeClass();
        $('body').addClass('success');
        return;
      }
      if (json && json.error) throw json.error;
      throw 'Something went wrong';
    });
}
