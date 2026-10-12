// Content script of the chibi dev extension, isolated world.
// Hands the current build (data.json, kept in sync by test/chibiDev/cli.js) to the runtime in the page.
let data = null;

function send() {
  if (data) window.dispatchEvent(new CustomEvent('chibi-dev-data', { detail: data }));
}

fetch(chrome.runtime.getURL('data.json'), { cache: 'no-store' })
  .then(response => response.text())
  .then(text => {
    data = text;
    send();
  });

// The runtime asks for the data in case it loads after the fetch finished
window.addEventListener('chibi-dev-request', send);
