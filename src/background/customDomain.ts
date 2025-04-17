import { ChibiListRepository } from '../pages-chibi/loader/ChibiListRepository';
import { isIframeUrl } from '../utils/manifest';

const logger = con.m('Custom Domain');

export type domainType = { domain: string; page: string; auto?: boolean; chibi?: boolean };

export async function initCustomDomain() {
  updateListener();
  await registerScripts();
  logger.log('Initialed');
}

function updateListener() {
  chrome.permissions.onAdded.addListener(registerScripts);
  chrome.permissions.onRemoved.addListener(registerScripts);
  api.storage.storageOnChanged((changes, namespace) => {
    if (namespace === 'sync' && changes['settings/customDomains']) {
      logger.log('settings/customDomains changed');
      registerScripts();
    }
  });
}

async function registerScripts() {
  if (typeof chrome.scripting === 'undefined') {
    con.error('Custom Domain is not possible');
    return;
  }

  let domains: domainType[] = await api.settings.getAsync('customDomains');

  try {
    const chibiRepo = await ChibiListRepository.getInstance().init();
    const chibiDomains = chibiRepo.getPermissions();
    domains = domains.concat(chibiDomains);
  } catch (e) {
    logger.error('Could not load chibi permissions', e);
  }

  await chrome.scripting.unregisterContentScripts();
  if (domains) {
    await Promise.all(domains.map(registerScript));
  }

  const scripts = await chrome.scripting.getRegisteredContentScripts();
  logger.log(scripts);
}

async function registerScript(domainConfig: domainType) {
  if (domainConfig.page === 'hostpermission') return;
  const fixDomain = domainConfig.domain;

  try {
    const scriptConfig = {
      id: fixDomain,
      js: ['vendor/jquery.min.js', 'i18n.js'],
      matches: [fixDomain],
      allFrames: false,
      runAt: 'document_start' as const,
    };

    if (domainConfig.page === 'iframe') {
      scriptConfig.js.push('content/iframe.js');
      scriptConfig.allFrames = true;
    } else if (domainConfig.chibi) {
      scriptConfig.js.push('content/chibi.js');
      scriptConfig.js.push('content/content-script.js');
    } else {
      scriptConfig.js.push(`content/page_${domainConfig.page}.js`);
      scriptConfig.js.push('content/content-script.js');
    }

    await chrome.scripting.registerContentScripts([scriptConfig]);
  } catch (e) {
    logger.error(`Could not add listener for ${fixDomain}`, e);
    return;
  }

  logger.m('registred').m(domainConfig.page).log(fixDomain);
}

export async function cleanupCustomDomains() {
  const manifest = chrome.runtime.getManifest();

  const pageScripts = manifest.content_scripts!.filter(content_script => {
    return content_script.js && content_script.js.some(e => /^content\/page_/.test(e));
  });

  let pageOrigins: string[] = [];
  pageScripts.forEach((item: any) => {
    pageOrigins = pageOrigins.concat(
      item.matches.map(origin => getComparableDomains(origin)).filter(el => el),
    );
  });

  const customDomains = await api.settings.getAsync('customDomains');

  if (customDomains) {
    api.settings.set(
      'customDomains',
      customDomains.filter(customDomain => {
        const domain = getComparableDomains(customDomain.domain);
        if (!domain) return true;
        return !isIframeUrl(customDomain.domain) && !pageOrigins.some(e => e.startsWith(domain));
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
