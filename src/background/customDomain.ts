/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/naming-convention */
// cspell:ignore hostpermission, registred
import { ChibiListRepository } from '../pages-chibi/loader/ChibiListRepository';
import { isIframeUrl } from '../utils/manifest';

const logger = con.m('Custom Domain');

export type domainType = { domain: string; page: string; auto?: boolean; chibi?: boolean };

let isRegistering = false;

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

  logger.m('registered').m(domainConfig.page).log(fixDomain);
}

async function registerScripts() {
  if (typeof chrome.scripting === 'undefined') {
    con.error('Custom Domain is not possible');
    return;
  }

  if (isRegistering) {
    logger.log('Already registering, skipping');
    return;
  }
  isRegistering = true;

  try {
    let domains: domainType[] = await api.settings.getAsync('customDomains');

    try {
      const chibiRepo = await ChibiListRepository.getInstance().init();
      const chibiDomains = chibiRepo.getPermissions();
      domains = domains.concat(chibiDomains);
    } catch (e) {
      logger.error('Could not load chibi permissions', e);
    }

    // Deduplicate domains by their pattern (id)
    const uniqueDomains: domainType[] = [];
    const seenDomains = new Set<string>();
    for (let i = 0; i < domains.length; i++) {
      const d = domains[i];
      if (!seenDomains.has(d.domain)) {
        uniqueDomains.push(d);
        seenDomains.add(d.domain);
      }
    }

    await chrome.scripting.unregisterContentScripts();
    if (uniqueDomains.length > 0) {
      // Register one by one or in batches to avoid internal race conditions if any
      await Promise.all(uniqueDomains.map(registerScript));
    }

    const scripts = await chrome.scripting.getRegisteredContentScripts();
    logger.log(scripts);
  } finally {
    isRegistering = false;
  }
}

function updateListener() {
  chrome.permissions.onAdded.addListener(registerScripts);
  chrome.permissions.onRemoved.addListener(registerScripts);
  api.storage.storageOnChanged((changes, namespace) => {
    if (namespace === 'sync' && changes['settings/customDomains']) {
      logger.log('settings/customDomains changed');
      registerScripts().catch(e => logger.error(e));
    }
    return undefined;
  });
}

export async function initCustomDomain() {
  updateListener();
  await registerScripts();
  logger.log('Initialed');
}

function getComparableDomains(domainOrigin) {
  const scriptDomain = domainOrigin.match(/^.+:\/\/?(.+)/);
  if (scriptDomain && scriptDomain.length > 1) {
    return scriptDomain[1].replace('*.', '').replace(/(\/|\/?\*)$/, '');
  }
  return '';
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
    await api.settings.set(
      'customDomains',
      customDomains.filter(customDomain => {
        const domain = getComparableDomains(customDomain.domain);
        if (!domain) return true;
        return !isIframeUrl(customDomain.domain) && !pageOrigins.some(e => e.startsWith(domain));
      }),
    );
  }
}
