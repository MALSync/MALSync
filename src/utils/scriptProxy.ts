import { generateUniqueID } from './scriptProxyWrapper';

export class ScriptProxy<T = any> {
  constructor(
    protected scriptName,
    protected elementId = generateUniqueID(),
  ) {
    return this;
  }

  async getData(retry: number = 1): Promise<T> {
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

        const resultElement = document.getElementById(eventData.data.resultId);
        if (!resultElement) throw new Error('Result element not found');
        const data = resultElement.getAttribute(`data-${eventId}`);
        resultElement.remove();
        if (!data) throw new Error('Result data not found');
        const result = JSON.parse(data);
        con.m('ScriptProxy').info('Result Received', result[this.elementId]);
        if (!result[this.elementId] && retry > 0) {
          con.m('ScriptProxy').info('Retrying');
          setTimeout(() => {
            resolve(this.getData(retry - 1));
          }, 1000);
        } else {
          resolve(result[this.elementId]);
        }
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
    api.storage.addProxyScriptToTag(scriptElement, this.scriptName);
    scriptElement.id = this.elementId;
    scriptElement.setAttribute(`data-${this.elementId}`, uniqueId);
    document.documentElement.appendChild(scriptElement);

    con.m('ScriptProxy').log('Script Added');

    return prom;
  }
}
