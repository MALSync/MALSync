const clientId = __MAL_SYNC_KEYS__.mangabaka.id;
const redirectUri = 'https://malsync.moe/mangabaka/oauth';
const clientSecret = __MAL_SYNC_KEYS__.mangabaka.secret;

export function mangabakaOauth() {
  $(document).ready(async function () {
    if (window.location.href.includes('code=') || window.location.href.includes('error=')) {
      try {
        if (window.location.href.includes('error=')) {
          const error = utils.urlParam(window.location.href, 'error_description') as string;
          throw error ? decodeURIComponent(error).replace(/\+/g, ' ') : 'Authentication error';
        }
        await getRefreshToken();
      } catch (e) {
        console.error(e);
        $('.card-text').first().text(`Error: ${e}`);
        $('body').removeClass();
        $('body').addClass('noExtension');
      }
      return;
    }
    await generateUrl();
  });
}

async function generateUrl() {
  const state = generateCodeVerifier();
  const challenge = await generateCodeChallenge(state);

  const scopes = ['library.read', 'library.write', 'openid', 'profile', 'offline_access'];
  sessionStorage.setItem('state', state);
  const url = `https://mangabaka.org/auth/oauth2/authorize?response_type=code&client_id=${clientId}&scope=${scopes.join('+')}&redirect_uri=${redirectUri}&code_challenge=${challenge}&code_challenge_method=S256`;
  $('.card-text.succ').prepend(
    j.html(`<a class="btn btn-outline-light" href="${url}">Start Authentication</a>`),
  );
  $('body').removeClass();
  $('body').addClass('success');
}

function generateCodeVerifier() {
  const array = new Uint8Array(128);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(hash));
}

function base64URLEncode(array: Uint8Array): string {
  let binary = '';
  // eslint-disable-next-line no-restricted-syntax
  for (const byte of array) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function getRefreshToken() {
  const code = utils.urlParam(window.location.href, 'code');
  window.history.replaceState('', '', '/mangabaka/oauth');
  if (!code) throw 'Url wrong';
  const challenge = sessionStorage.getItem('state');
  if (!challenge) throw 'No challenge found';
  return api.request
    .xhr('POST', {
      url: 'https://mangabaka.org/auth/oauth2/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: `&client_id=${clientId}&client_secret=${clientSecret}&grant_type=authorization_code&code=${code}&code_verifier=${challenge}&redirect_uri=${redirectUri}`,
    })
    .then(res => JSON.parse(res.responseText))
    .then(json => {
      if (json && json.id_token && json.access_token) {
        api.settings.set('mangabakaToken', json.access_token);
        api.settings.set('mangabakaRefresh', json.refresh_token);
        $('.card-text.succ').prepend(j.html(api.storage.lang('anilistClass_authentication')));
        $('body').removeClass();
        $('body').addClass('success');
        return;
      }
      if (json && json.error) throw json.error;
      throw 'Something went wrong';
    });
}
