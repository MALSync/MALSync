export function trackingBarElement() {
  const progressDiv = document.createElement('div');
  progressDiv.id = 'malSyncProgress';
  progressDiv.className = 'ms-loading';
  progressDiv.style.cssText = `
    background-color: transparent;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
  `;

  const resumeInnerDiv = document.createElement('div');
  resumeInnerDiv.className = 'ms-progress-resume';
  resumeInnerDiv.style.cssText = `
    border-top: 4px dashed #2980b9;
    width: 0%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  `;
  progressDiv.appendChild(resumeInnerDiv);

  const progressInnerDiv = document.createElement('div');
  progressInnerDiv.className = 'ms-progress';
  progressInnerDiv.style.cssText = `
    background-color: #2980b9;
    width: 0%;
    height: 100%;
    transition: width 1s;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  `;
  progressDiv.appendChild(progressInnerDiv);

  return progressDiv;
}

export function trackingSyncButtonElement(buttonText: string) {
  const syncButton = document.createElement('button');
  syncButton.className = 'sync';
  syncButton.style = `
    margin-bottom: 8px;
    background-color: transparent;
    border: none;
    color: rgb(255,64,129);
    margin-top: 10px;
    cursor: pointer;
  `;
  syncButton.innerText = buttonText;

  return syncButton;
}

export function trackingNoteElement(noteText: string) {
  const noteDiv = document.createElement('div');
  noteDiv.style = 'margin-top: 5px; font-size: 0.9em; color: #ccc;';
  noteDiv.innerText = noteText;

  return noteDiv;
}

export function trackingErrorElement() {
  const errorDiv = document.createElement('div');
  errorDiv.id = 'malSyncError';

  return errorDiv;
}

export function resumeMessageElement(buttonText: string) {
  const resumeMessageDiv = document.createElement('div');
  const resumeButton = document.createElement('button');
  resumeButton.id = 'MALSyncResume';
  resumeButton.className = 'sync';
  resumeButton.style.cssText = `
    display: block;
    margin-bottom: 2px;
    background-color: transparent;
    border: none;
    color: rgb(255,64,129);
    cursor: pointer;
  `;
  resumeButton.innerText = buttonText;
  resumeMessageDiv.appendChild(resumeButton);

  const closeButton = document.createElement('button');
  closeButton.className = 'resumeClose';
  closeButton.style.cssText = `
    display: block;
    background-color: transparent;
    border: none;
    color: white;
    margin-top: 10px;
    cursor: pointer;
    justify-self: center;
  `;
  closeButton.innerText = api.storage.lang('close');
  resumeMessageDiv.appendChild(closeButton);

  return resumeMessageDiv;
}

export function videoStrategyErrorElement(hasMissingPermissions: boolean) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'player-error';
  errorDiv.style.cssText = `
    display: block;
    padding: 5px;
    padding-top: 15px;
    outline: 1px solid #e13f7b;
  `;

  const linkContainer = document.createElement('div');
  linkContainer.style.cssText = `
    display: flex;
    justify-content: space-evenly;
  `;

  const defaultSpan = document.createElement('p');
  defaultSpan.className = 'player-error-default';
  defaultSpan.textContent = api.storage.lang('syncPage_flash_player_error');
  errorDiv.appendChild(defaultSpan);

  if (hasMissingPermissions) {
    const missingPermissionsSpan = document.createElement('span');
    missingPermissionsSpan.className = 'player-error-missing-permissions';
    missingPermissionsSpan.style.cssText = `
      padding-top: 10px;
    `;
    missingPermissionsSpan.textContent = api.storage.lang(
      'settings_custom_domains_missing_permissions_header',
    );
    errorDiv.appendChild(missingPermissionsSpan);

    const addLink = document.createElement('a');
    addLink.className = 'player-error-missing-permissions';
    addLink.href = 'https://malsync.moe/pwa/#/settings/customDomains';
    addLink.style.cssText = `
      margin: 10px;
      border-bottom: 2px solid #e13f7b;
    `;
    addLink.textContent = api.storage.lang('Add');
    linkContainer.appendChild(addLink);
  }

  const helpLink = document.createElement('a');
  helpLink.href = 'https://discord.com/invite/cTH4yaw';
  helpLink.style.cssText = `
    display: block;
    margin: 10px;
  `;
  helpLink.textContent = 'Help';

  linkContainer.appendChild(helpLink);

  errorDiv.appendChild(linkContainer);

  return errorDiv;
}
