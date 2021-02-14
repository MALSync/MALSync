export const defaultImg = 'https://raw.githubusercontent.com/MALSync/MALSync/master/assets/icons/icon128.png';

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
    type: 'basic',
    title: options.title,
    message: options.text,
    iconUrl: imgBlob,
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
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);

    xhr.responseType = 'blob';

    xhr.onload = function() {
      if (xhr.status === 200) {
        const blob = xhr.response;
        resolve(window.URL.createObjectURL(blob));
      }
      reject(xhr.status);
    };

    xhr.onerror = function(e) {
      reject(e);
    };

    xhr.send();
  }).catch(e => {
    if (!fallback) {
      con.info('Could not get image for notification', url);
      return getImageBlob(url, true);
    }
    throw e;
  });
}
