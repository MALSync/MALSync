// MyAnimePulse OAuth handler — auto-captures token from the auth page
api.settings.init().then(() => {
  // Poll for the token element (it loads async after auth)
  const interval = setInterval(() => {
    const codeEl = document.querySelector('code');
    if (codeEl?.textContent?.startsWith('ap_')) {
      clearInterval(interval);
      const token = codeEl.textContent.trim();
      api.settings.set('animepulseToken', token).then(() => {
        // Replace page with success message
        document.body.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;font-family:system-ui;color:white;background:#0c0c0c;">
            <div style="width:48px;height:48px;border-radius:50%;background:rgba(52,211,153,0.1);display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34D399" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <h1 style="font-size:20px;font-weight:700;margin-bottom:4px;">Connected to MyAnimePulse</h1>
            <p style="color:#888;font-size:14px;">Token saved. You can close this page.</p>
          </div>
        `;
      });
    }
  }, 500);

  // Stop polling after 30 seconds
  setTimeout(() => clearInterval(interval), 30000);

  // Also listen for postMessage
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'animepulse-token' && event.data?.token) {
      clearInterval(interval);
      api.settings.set('animepulseToken', event.data.token).then(() => {
        document.body.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;font-family:system-ui;color:white;background:#0c0c0c;">
            <div style="width:48px;height:48px;border-radius:50%;background:rgba(52,211,153,0.1);display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34D399" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <h1 style="font-size:20px;font-weight:700;margin-bottom:4px;">Connected to MyAnimePulse</h1>
            <p style="color:#888;font-size:14px;">Token saved. You can close this page.</p>
          </div>
        `;
      });
    }
  });
});
