let running = false;
let messageHash = 'notSet';

document.addEventListener('DOMContentLoaded', function () {
  if (running) return;
  running = true;
  const ifrm = window.document.createElement('iframe');
  ifrm.setAttribute('src', iframeUrl());
  document.body.appendChild(ifrm);
  window.addEventListener('hashchange', () => {
    if (messageHash.replace('#', '') === window.location.hash.replace('#', '')) return;
    ifrm.setAttribute('src', iframeUrl());
  });
});

function iframeUrl() {
  return chrome.runtime.getURL('window.html') + window.location.hash;
}

chrome.runtime.onMessage.addListener(msg => {
  if (msg.action === 'content' && msg.item.action === 'pwaPath') {
    messageHash = msg.item.data.path;
    window.location.hash = msg.item.data.path;
  }
});
