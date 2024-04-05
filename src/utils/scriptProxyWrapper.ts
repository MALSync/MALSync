/**
 * Generates a (hex) string ID for randomisation/verification.
 */
export function generateUniqueID(arraySize = 10): string {
  const array = new Uint32Array(arraySize);
  window.crypto.getRandomValues(array);
  return Array.from(array, value => value.toString(16)).join('');
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
