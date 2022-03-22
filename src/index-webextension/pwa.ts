let running = false;
document.addEventListener('DOMContentLoaded', function () {
  if (running) return;
  running = true;
  const ifrm = window.document.createElement('iframe');
  ifrm.setAttribute('src', chrome.runtime.getURL('window.html') + window.location.hash);
  document.body.appendChild(ifrm);
});
