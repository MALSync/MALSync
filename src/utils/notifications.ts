const defaultImg = 'https://raw.githubusercontent.com/MALSync/MALSync/master/assets/icons/icon128.png';

// Only works on the background Page
export async function sendNotification(options: {
  url: string;
  title: string;
  text: string;
  image?: string;
  sticky?: boolean;
}) {
  if (!options.image) options.image = defaultImg;

  const imgBlob = await getImageBlob(options.image);

  chrome.notifications.create(options.url, {
    type: 'basic',
    title: options.title,
    message: options.text,
    iconUrl: imgBlob,
    requireInteraction: options.sticky ?? false,
    eventTime: Date.now(),
  });
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
