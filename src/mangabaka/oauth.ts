const clientId = __MAL_SYNC_KEYS__.mangabaka.id;
const redirectUri = 'https://malsync.moe/mangabaka/oauth';
const clientSecret = __MAL_SYNC_KEYS__.mangabaka.secret;
const verifierStorageKey = 'mangabaka_pkce_verifier';
const stateStorageKey = 'mangabaka_oauth_state';

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
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const state = generateCodeVerifier().slice(0, 48);

  const scopes = ['library.read', 'library.write', 'openid', 'profile', 'offline_access'];
  sessionStorage.setItem(verifierStorageKey, verifier);
  sessionStorage.setItem(stateStorageKey, state);
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: scopes.join(' '),
    redirect_uri: redirectUri,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state,
  });
  const url = `https://mangabaka.org/auth/oauth2/authorize?${params.toString()}`;
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
  const returnedState = utils.urlParam(window.location.href, 'state');
  const expectedState = sessionStorage.getItem(stateStorageKey);
  window.history.replaceState('', '', '/mangabaka/oauth');
  if (!code) throw 'Url wrong';
  if (expectedState && returnedState && expectedState !== returnedState) throw 'State mismatch';
  const verifier = sessionStorage.getItem(verifierStorageKey);
  if (!verifier) throw 'No challenge found';
  sessionStorage.removeItem(verifierStorageKey);
  sessionStorage.removeItem(stateStorageKey);
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'authorization_code',
    code,
    code_verifier: verifier,
    redirect_uri: redirectUri,
  });
  return api.request
    .xhr('POST', {
      url: 'https://mangabaka.org/auth/oauth2/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: body.toString(),
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
