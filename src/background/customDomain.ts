const logger = con.m('Custom Domain');

type domainType = { domain: string; page: string };

export async function initCustomDomain() {
  await setListener();
  updateListener();
  logger.log('Initialed');
}

function updateListener() {
  chrome.permissions.onAdded.addListener(setListener);
  chrome.permissions.onRemoved.addListener(setListener);
  api.storage.storageOnChanged((changes, namespace) => {
    if (namespace === 'sync' && changes['settings/customDomains']) {
      logger.log('settings/customDomains changed');
      setListener();
    }
  });
}

async function setListener() {
  const domains: domainType[] = await api.settings.getAsync('customDomains');
  clearListener();
  domains.forEach(d => singleListener(d));
}

let listenerArray: any[] = [];

function clearListener() {
  logger.log('Clear listener', listenerArray.length);
  listenerArray.forEach(listen => chrome.webNavigation.onCompleted.removeListener(listen));
  listenerArray = [];
}

function singleListener(domainConfig: domainType) {
  const callback = data => {
    logger.m('Navigation').log(domainConfig, data);
    if (domainConfig.page === 'iframe') {
      if (!data.frameId) {
        logger.m('Navigation').log('Do not inject iframe on root page');
        return;
      }
      chrome.tabs.executeScript(data.tabId, {
        file: 'vendor/jquery.min.js',
        frameId: data.frameId,
      });
      chrome.tabs.executeScript(data.tabId, {
        file: 'i18n.js',
        frameId: data.frameId,
      });
      chrome.tabs.executeScript(data.tabId, {
        file: 'content/iframe.js',
        frameId: data.frameId,
      });
    } else {
      if (data.frameId) {
        logger.m('Navigation').log('Do not inject page scripts in Iframe');
        return;
      }
      chrome.tabs.executeScript(data.tabId, {
        file: 'vendor/jquery.min.js',
        frameId: data.frameId,
      });
      chrome.tabs.executeScript(data.tabId, {
        file: 'i18n.js',
        frameId: data.frameId,
      });
      chrome.tabs.executeScript(data.tabId, {
        file: `content/page_${domainConfig.page}.js`,
        frameId: data.frameId,
      });
      chrome.tabs.executeScript(data.tabId, {
        file: 'content/content-script.js',
        frameId: data.frameId,
      });
    }
  };
  listenerArray.push(callback);
  chrome.webNavigation.onCompleted.addListener(callback, {
    url: [{ originAndPathMatches: domainConfig.domain }],
  });
  logger
    .m('registred')
    .m(domainConfig.page)
    .log(domainConfig.domain);
}

export async function cleanupCustomDomains() {
  const manifest = chrome.runtime.getManifest();
  const iframeScript = manifest.content_scripts!.find(content_script => {
    return content_script.js && content_script.js.includes('content/iframe.js');
  });

  if (!iframeScript) throw 'No iframe content script found';

  const contentOrigins = iframeScript.matches!.map(origin => getComparableDomains(origin)).filter(el => el);

  const customDomains = await api.settings.getAsync('customDomains');

  if (customDomains) {
    api.settings.set(
      'customDomains',
      customDomains.filter(customDomain => {
        const domain = getComparableDomains(customDomain.domain);
        if (!domain) return true;
        return !contentOrigins.includes(domain);
      }),
    );
  }
}

function getComparableDomains(domainOrigin) {
  const scriptDomain = domainOrigin.match(/^.+:\/\/?(.+)/);
  if (scriptDomain && scriptDomain.length > 1) {
    return scriptDomain[1].replace('*.', '').replace(/(\/|\/?\*)$/, '');
  }
  return '';
}
