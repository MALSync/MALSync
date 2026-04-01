// AnimePulse OAuth handler — captures token from the auth page
api.settings.init().then(() => {
  $(document).ready(function () {
    // Listen for token from the AnimePulse auth page
    window.addEventListener('message', (event) => {
      if (event.data?.type === 'animepulse-token' && event.data?.token) {
        api.settings.set('animepulseToken', event.data.token).then(() => {
          document.body.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;font-family:system-ui;color:white;background:#0c0c0c;">
              <h1 style="font-size:24px;margin-bottom:8px;">✓ Connected to AnimePulse</h1>
              <p style="color:#888;">Token saved. You can close this page.</p>
            </div>
          `;
        });
      }
    });

    // Also check if token is in the page content (fallback)
    const tokenEl = document.querySelector('code');
    if (tokenEl?.textContent?.startsWith('ap_')) {
      const token = tokenEl.textContent.trim();
      api.settings.set('animepulseToken', token).then(() => {
        document.body.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;font-family:system-ui;color:white;background:#0c0c0c;">
            <h1 style="font-size:24px;margin-bottom:8px;">✓ Connected to AnimePulse</h1>
            <p style="color:#888;">Token saved. You can close this page.</p>
          </div>
        `;
      });
    }
  });
});
