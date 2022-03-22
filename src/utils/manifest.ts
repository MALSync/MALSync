import { patternToRegex } from 'webext-patterns';

export function isIframeUrl(url: string): boolean {
  try {
    const manifest = chrome.runtime.getManifest();

    const iframeScript = manifest.content_scripts!.find(content_script => {
      return content_script.js && content_script.js.includes('content/iframe.js');
    });

    if (!iframeScript || !iframeScript.matches) return false;

    return patternToRegex(...iframeScript.matches).test(url);
  } catch (e) {
    return false;
  }
}

export function hasDomainPermission(url: string): boolean {
  try {
    const manifest = chrome.runtime.getManifest();

    const found = manifest.content_scripts!.some(
      script => script.matches && script.matches.some(pattern => patternToRegex(pattern).test(url)),
    );

    return found;
  } catch (e) {
    return false;
  }
}
