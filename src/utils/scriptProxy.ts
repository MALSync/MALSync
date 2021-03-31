import { generateUniqueID } from './general';

export class ScriptProxy {
  /// A list of variables ('name' = 'salt'/'function' pair) that will be captured
  /// in an execution.
  /// The salt here is to prevent conflicts with other 'data-' elements.
  protected capturedVariables: Map<string, [string, string]> = new Map();

  /**
   * Creates a new ScriptProxy.
   *
   * @param elementId The name of the element to inject. This is randomly generated
   *                  by default, though this can be changed if this needs to be directly
   *                  interacted with.
   */
  constructor(protected elementId = generateUniqueID()) {
    return this;
  }

  /**
   * Registers a variable to capture from the guest page.
   *
   * @param name The name of the variable. Fetchable later. Should be a valid HTML
   *             attribute name/Javascript identifier.
   * @param scriptContents The *string* contents of an anonymous function which will be
   *                       called to capture the contents of the page.
   *
   * @example
   *    ```
   *    addCaptureVariable('metadata', `
   *      return some_object.metadata
   *    `)
   *    ```
   */
  addCaptureVariable(name: string, scriptContents: string) {
    this.capturedVariables.set(name, [generateUniqueID(), scriptContents]);
  }

  /**
   * Fetches a captured variable's contents.
   *
   * @param name The name of the variable. Must have been registered -
   *             @see ScriptProxy.addCaptureVariable
   * @returns Either the object from the page, or undefined if an error occurred/
   *          no proxy exists.
   */
  getCaptureVariable(name: string): object | undefined {
    const element = j.$(`#${this.elementId}`);

    // jQuery parses null here
    if (element === null) {
      return undefined;
    }

    const attrName = this.capturedVariables.get(name);

    if (attrName === undefined) {
      return undefined;
    }

    const elementContents = element.attr(`data-${attrName[0]}`);

    if (elementContents === undefined) {
      return undefined;
    }

    return JSON.parse(elementContents);
  }

  /**
   * Adds a proxy to the running webpage, capturing all required variables.
   *
   * @param callback An optional callback function that is called when the proxy operation
   *                 completes.
   */
  addProxy(callback: ((caller: ScriptProxy) => void) | undefined = undefined) {
    // Cleanup any previous attempts
    const previousElement = j.$(`#${this.elementId}`);
    if (previousElement !== null) {
      previousElement.remove();
    }

    // Generate a unique ID to prevent attacks:
    const uniqueId = generateUniqueID();

    // Add the callback function as a one-off
    const callbackFunction = (event: Event) => {
      if (!(event instanceof MessageEvent)) {
        return;
      }

      const eventData: MessageEvent = event;

      if (eventData.data.uniqueId !== uniqueId) return;

      // Automatically remove this now - we only need this for a single call:
      window.removeEventListener('message', callbackFunction);

      if (callback !== undefined) {
        callback(this);
      }
    };

    window.addEventListener('message', callbackFunction, false);

    // Build the contents of the script to inject.
    let scriptContents = `
      {
        const element = document.getElementById('${this.elementId}');
    `;

    this.capturedVariables.forEach((value, key) => {
      // Build an anonymous function to give the caller a sane environment,
      // then inject it into a data attribute.
      const funcId = generateUniqueID();

      scriptContents += `
        const func_${funcId} = () => {${value[1]}};
        element.setAttribute('data-${value[0]}', JSON.stringify(func_${funcId}()));
      `;
    });

    // Invoke our callback finally.
    scriptContents += `
        window.postMessage({"uniqueId": "${uniqueId}"}, "*");
      }
    `;

    const scriptElement = document.createElement('script');
    const scriptTextElement = document.createTextNode(scriptContents);

    scriptElement.id = this.elementId;
    scriptElement.appendChild(scriptTextElement);

    // Note: we *intentionally* want XSS here - our element is manually constructed
    //       and as such we don't want to sanitize the script (as the lint suggests).
    // eslint-disable-next-line jquery-unsafe-malsync/no-xss-jquery
    j.$('body').append(scriptElement);
  }

  async getProxyVariable(name: string): Promise<object | undefined> {
    return new Promise((resolve, reject) => {
      this.addProxy(async (caller: ScriptProxy) => {
        resolve(this.getCaptureVariable(name));
      });
    });
  }
}
