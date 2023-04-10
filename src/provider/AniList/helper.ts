export function errorHandling(res, silent = false): any {
  if (typeof res.errors !== 'undefined') {
    for (let i = 0, len = res.errors.length; i < len; i++) {
      const error = res.errors[i];
      switch (error.status) {
        case 400:
          if (!silent) {
            utils.flashm(
              api.storage.lang('Error_Authenticate', [
                'https://anilist.co/api/v2/oauth/authorize?client_id=1487&response_type=token',
              ]),
              {
                error: true,
                type: 'error',
              },
            );
            return 'noLogin';
            break;
          }
        case 404:
          if (!silent) {
            utils.flashm(`anilist: ${error.message}`, {
              error: true,
              type: 'error',
            });
            break;
          }
        default:
          if (!silent)
            utils.flashm(`anilist: ${error.message}`, {
              error: true,
              type: 'error',
            });
          throw error.message;
      }
    }
  }
  return true;
}

export function aniListToMal(anilistId: number, type: 'anime' | 'manga') {
  const query = `
  query ($id: Int, $type: MediaType) {
    Media (id: $id, type: $type) {
      id
      idMal
    }
  }
  `;
  const variables = {
    id: anilistId,
    type: type.toUpperCase(),
  };

  return api.request
    .xhr('POST', {
      url: 'https://graphql.anilist.co',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      data: JSON.stringify({
        query,
        variables,
      }),
    })
    .then(response => {
      const res = JSON.parse(response.responseText);
      con.log(res);
      errorHandling(res);
      return res.data.Media.idMal;
    });
}
