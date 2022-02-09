import { createApp as vueCreateApp } from 'vue';
import VueDOMPurifyHTML from 'vue-dompurify-html';

export function createApp(component, selector: string | HTMLElement, option?: { shadowDom?: boolean }) {
  const app = vueCreateApp(component);
  app.use(VueDOMPurifyHTML, { default: { ADD_ATTR: ['target'] } });

  let rootElement = typeof selector === 'string' ? document.querySelector(selector) : selector;

  if (!rootElement) throw new Error("Can't find root element");

  if (option && option.shadowDom) {
    let shadowRoot: ShadowRoot;
    if (rootElement.shadowRoot) {
      shadowRoot = rootElement.shadowRoot;
      shadowRoot.innerHTML = '';
    } else {
      shadowRoot = rootElement.attachShadow({ mode: 'open' });
    }

    if (component.styles) {
      shadowRoot.appendChild(createStyleTag(component.styles));
    }

    rootElement = shadowRoot.appendChild(document.createElement('div'));
  }

  const root = app.mount(rootElement);

  // inject Styles
  if (component.styles && (!option || !option.shadowDom)) {
    const style = document.createElement('style');
    style.type = 'text/css';
    const styleText = document.createTextNode(component.styles);
    style.appendChild(styleText);
    // eslint-disable-next-line jquery-unsafe-malsync/no-xss-jquery
    root.$el.after(createStyleTag(component.styles));
  }

  return root;
}


function createStyleTag(styleString: string) {
  const style = document.createElement('style');
  style.type = 'text/css';
  const styleText = document.createTextNode(styleString);
  style.appendChild(styleText);
  return style;
}
