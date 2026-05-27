// Captures the `ap_` extension token shown on myanimepulse.com/auth/extension
// and stores it. Shared by the extension content script
// (index-webextension/myanimepulseOauth.ts) and the userscript entry
// (index.ts), mirroring how the other providers expose their oauth handler.

function showConnected() {
  document.body.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;font-family:system-ui;color:white;background:#0c0c0c;">
      <div style="width:48px;height:48px;border-radius:50%;background:rgba(52,211,153,0.1);display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34D399" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
      </div>
      <h1 style="font-size:20px;font-weight:700;margin-bottom:4px;">Connected to MyAnimePulse</h1>
      <p style="color:#888;font-size:14px;">Token saved. You can close this page.</p>
    </div>
  `;
}

export function myAnimePulseOauth() {
  const save = (token: string) => {
    api.settings.set('animepulseToken', token).then(showConnected);
  };

  // The token renders async after auth, so poll for the code element.
  const interval = setInterval(() => {
    const codeEl = document.querySelector('code');
    if (codeEl?.textContent?.startsWith('ap_')) {
      clearInterval(interval);
      save(codeEl.textContent.trim());
    }
  }, 500);
  setTimeout(() => clearInterval(interval), 30000);

  // Fast path: the page also posts the token directly.
  window.addEventListener('message', event => {
    if (event.data?.type === 'myanimepulse-token' && event.data?.token) {
      clearInterval(interval);
      save(event.data.token);
    }
  });
}
