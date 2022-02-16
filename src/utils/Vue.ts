import { createApp as vueCreateApp, App } from 'vue';
import VueDOMPurifyHTML from 'vue-dompurify-html';

export function createApp(
  component,
  selector: string | HTMLElement,
  option?: { shadowDom?: boolean; use?: (vue: App) => void },
) {
  const componentStyles = getAllStyles(component).join('\n');
  const app = vueCreateApp(component);
  app.use(VueDOMPurifyHTML, { default: { ADD_ATTR: ['target'] } });

  if (option && option.use) {
    option.use(app);
  }

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

    if (componentStyles) {
      shadowRoot.appendChild(createStyleTag(componentStyles));
    }

    rootElement = shadowRoot.appendChild(document.createElement('div'));
  }

  const root = app.mount(rootElement);

  // inject Styles
  if (componentStyles && (!option || !option.shadowDom)) {
    // eslint-disable-next-line jquery-unsafe-malsync/no-xss-jquery
    root.$el.after(createStyleTag(componentStyles));
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

function getAllStyles(component): string[] {
  const styles: string[] = [];
  if (component.styles) {
    styles.push(...component.styles);
  }
  if (component.components) {
    for (const key in component.components) {
      const subComponent = component.components[key];
      styles.push(...getAllStyles(subComponent));
    }
  }
  return styles;
}
