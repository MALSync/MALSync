/**
 * Generates a (hex) string ID for randomisation/verification.
 */
export function generateUniqueID(arraySize = 10): string {
  const array = new Uint32Array(arraySize);
  window.crypto.getRandomValues(array);
  return Array.from(array, value => value.toString(16)).join('');
}

export class ScriptProxy<T = any> {
  constructor(
    protected scriptName,
    protected elementId = generateUniqueID(),
  ) {
    return this;
  }

  async getData(): Promise<T> {
    return new Promise((resolve, reject) => {
      const eventId = generateUniqueID();

      const callbackFunction = (event: Event) => {
        if (!(event instanceof MessageEvent)) {
          return;
        }

        const eventData: MessageEvent = event;

        if (
          !eventData.data.eventId ||
          !eventData.data.resultId ||
          eventData.data.eventId !== eventId
        )
          return;

        window.removeEventListener('message', callbackFunction);
        con.m('ScriptProxy').log('Result Received');

        const resultElement = document.getElementById(eventData.data.resultId);
        if (!resultElement) throw new Error('Result element not found');
        const data = resultElement.getAttribute(`data-${eventId}`);
        resultElement.remove();
        if (!data) throw new Error('Result data not found');
        const result = JSON.parse(data);
        resolve(result[this.elementId]);
      };

      window.addEventListener('message', callbackFunction, false);
      window.postMessage({ eventId }, '*');
    });
  }

  async injectScript() {
    let loaded: () => void;

    const uniqueId = generateUniqueID();

    const prom = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('ScriptProxy timed out'));
      }, 5000);
      loaded = () => {
        clearTimeout(timeout);
        resolve(true);
      };
    });

    const callbackFunction = (event: Event) => {
      if (!(event instanceof MessageEvent)) {
        return;
      }

      const eventData: MessageEvent = event;

      if (eventData.data.uniqueId !== uniqueId) return;

      window.removeEventListener('message', callbackFunction);
      con.m('ScriptProxy').log('Script Loaded');
      loaded();
    };

    window.addEventListener('message', callbackFunction, false);

    const scriptElement = document.createElement('script');
    scriptElement.src = chrome.runtime.getURL(`/content/proxy/proxy_${this.scriptName}.js`);
    scriptElement.id = this.elementId;
    scriptElement.setAttribute(`data-${this.elementId}`, uniqueId);
    document.documentElement.appendChild(scriptElement);

    con.m('ScriptProxy').log('Script Added');

    return prom;
  }
}

export function ScriptProxyWrapper(fnc: () => void) {
  const tag = document.currentScript as HTMLScriptElement;
  const idAttribute = tag.getAttribute('id')!;
  const logger = con.m('ScriptProxyWrapper');

  window.addEventListener(
    'message',
    event => {
      if (!(event instanceof MessageEvent)) {
        return;
      }

      const eventData: MessageEvent = event;

      if (!eventData.data.eventId || eventData.data.resultId) return;

      const resultId = generateUniqueID();
      const res = fnc();

      const scriptElement = document.createElement('script');
      scriptElement.id = resultId;
      scriptElement.setAttribute(
        `data-${eventData.data.eventId}`,
        JSON.stringify({
          [idAttribute]: res,
        }),
      );
      document.documentElement.appendChild(scriptElement);

      window.postMessage({ eventId: eventData.data.eventId, resultId }, '*');
    },
    false,
  );

  window.postMessage({ uniqueId: tag.getAttribute(`data-${idAttribute}`) }, '*');

  logger.log('Listener Added');
  tag.remove();
}
