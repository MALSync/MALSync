/* eslint-disable consistent-return */
export function script() {
  if (!(window as any).fetchOverride) {
    (window as any).malsyncData = {};

    // eslint-disable-next-line no-var
    var originalFetch = fetch;
    // @ts-ignore
    // eslint-disable-next-line no-global-assign
    fetch = (input, init) =>
      originalFetch(input, init).then(response => {
        try {
          const url = input.url || input;
          if (url.includes('/api/')) {
            const res = response.clone();
            res.json().then(data => {
              if (data && data.type && data.type === 'VOD' && data.id) {
                (window as any).malsyncData[data.id] = data;
                checkForTitle(url, data, init)
                  .then(title => {
                    if (title) {
                      (window as any).malsyncData[data.id].malsync_title = title;
                    }
                  })
                  .finally(() => {
                    (window as any).malsyncData[data.id].done = true;
                  });
              }
            });
          }
        } catch (e) {
          console.error('MALSYNC', e);
        }

        return response;
      });

    console.log('MALSYNC', 'Fetch override added.');
    (window as any).fetchOverride = true;
  }

  if (Object.prototype.hasOwnProperty.call(window as any, 'malsyncData')) {
    return (window as any).malsyncData;
  }
  return undefined;

  async function checkForTitle(url, data, options) {
    if (!url) return;
    if (!data.episodeInformation || !data.episodeInformation.season) return;
    const seriesId = String(data.episodeInformation.season);
    if (!seriesId) return;
    const storageTitle = window.sessionStorage.getItem(`malsyncData_${seriesId}`);
    if (storageTitle) return storageTitle;
    url = new URL(url);
    url.pathname = 'api/v1/view';
    url.search = `?type=season&id=${seriesId}`;
    return originalFetch(url.toString(), options).then(response => {
      return response.json().then(data2 => {
        const header = data2.elements.find(x => x.$zone === 'header');
        if (!header) return;
        const title = header.attributes.header.attributes.text;
        if (!title) return;
        window.sessionStorage.setItem(`malsyncData_${seriesId}`, title);
        return title;
      });
    });
  }
}
