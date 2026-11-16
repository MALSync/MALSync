const clientId = __MAL_SYNC_KEYS__.animeoshi.id;
const redirectUri = 'https://malsync.moe/animeoshi/oauth';
const verifierStorageKey = 'animeoshi_pkce_verifier';
const stateStorageKey = 'animeoshi_oauth_state';

export function animeoshiOauth() {
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

  sessionStorage.setItem(verifierStorageKey, verifier);
  sessionStorage.setItem(stateStorageKey, state);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state,
  });
  const url = `https://www.animeoshi.com/oauth/consent?${params.toString()}`;
  $('.card-text.succ').prepend(
    j.html(`<a class="btn btn-outline-light" href="${url}">Start Authentication</a>`),
  );
  $('body').removeClass();
  $('body').addClass('success');
}

function generateCodeVerifier() {
  const array = new Uint8Array(96);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

async function generateCodeChallenge(verifier) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
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
  const verifier = sessionStorage.getItem(verifierStorageKey);
  window.history.replaceState('', '', '/animeoshi/oauth');

  if (!code) throw 'Url wrong';
  // Fail closed, a replayed or forged redirect must not be exchanged
  if (!expectedState || expectedState !== returnedState) throw 'State mismatch';
  if (!verifier) throw 'No challenge found';
  sessionStorage.removeItem(verifierStorageKey);
  sessionStorage.removeItem(stateStorageKey);

  return api.request
    .xhr('POST', {
      url: 'https://www.animeoshi.com/api/anime/v1/oauth/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        code,
        code_verifier: verifier,
        redirect_uri: redirectUri,
      }).toString(),
    })
    .then(res => JSON.parse(res.responseText))
    .then(json => {
      if (json && json.access_token && json.refresh_token) {
        api.settings.set('animeoshiToken', json.access_token);
        api.settings.set('animeoshiRefresh', json.refresh_token);
        $('.card-text.succ').prepend(j.html(api.storage.lang('anilistClass_authentication')));
        $('body').removeClass();
        $('body').addClass('success');
        return;
      }
      if (json && json.error) throw json.error_description || json.error;
      throw 'Something went wrong';
    });
}
