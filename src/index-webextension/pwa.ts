let running = false;
document.addEventListener('DOMContentLoaded', function () {
  if (running) return;
  running = true;
  const ifrm = window.document.createElement('iframe');
  ifrm.setAttribute('src', iframeUrl());
  document.body.appendChild(ifrm);
  window.addEventListener('hashchange', () => {
    ifrm.setAttribute('src', iframeUrl());
  });
});

function iframeUrl() {
  return chrome.runtime.getURL('window.html') + window.location.hash;
}
