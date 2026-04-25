export const defaultImg =
  'https://raw.githubusercontent.com/MALSync/MALSync/master/assets/icons/icon128.png';

// Only works on the background Page
export async function sendNotification(options: {
  url: string;
  title: string;
  text: string;
  image?: string;
  sticky?: boolean;
}) {
  if (!options.image) options.image = defaultImg;

  con.m('Notification').log(options);

  const imgBlob = await getImageBlob(options.image);
  const messageArray = {
    type: 'basic' as const,
    title: options.title,
    message: options.text,
    iconUrl: imgBlob,
    contextMessage: 'MAL-Sync',
    requireInteraction: options.sticky ?? false,
    eventTime: Date.now(),
  };
  try {
    chrome.notifications.create(options.url, messageArray);
  } catch (e) {
    con.error(e);
    // @ts-ignore
    delete messageArray.requireInteraction;
    chrome.notifications.create(options.url, messageArray);
  }
}

function getImageBlob(url, fallback = false): Promise<string> {
  if (fallback) url = defaultImg;
  return fetch(url)
    .then(r => {
      if (!r.ok) throw new Error('Could not get image');
      return r.blob();
    })
    .then(blob => blobToBase64(blob))
    .catch(e => {
      if (!fallback) {
        con.info('Could not get image for notification', url);
        return getImageBlob(url, true);
      }
      throw e;
    });
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}
