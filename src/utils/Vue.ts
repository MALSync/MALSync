import { createApp as vueCreateApp, App } from 'vue';
import VueDOMPurifyHTML from 'vue-dompurify-html';

export function createApp(
  component,
  selector: string | HTMLElement,
  option?: { shadowDom?: boolean; use?: (vue: App) => void },
) {
  const app = vueCreateApp(component);
  app.use(VueDOMPurifyHTML, {
    default: { ADD_ATTR: ['target'] },
    namedConfigurations: {
      noMedia: { FORBID_TAGS: ['img', 'svg', 'picture', 'video', 'audio'] },
    },
  });

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

    rootElement = shadowRoot.appendChild(document.createElement('div'));
  }

  const loadedStyles: { [key: string]: boolean } = {};

  app.mixin({
    beforeCreate() {
      if (this.$options.styles && !loadedStyles[this.$options.__file]) {
        rootElement!.appendChild(
          createStyleTag(this.$options.styles.join('\n'), this.$options.__file),
        );
        loadedStyles[this.$options.__file] = true;
      }
    },
    methods: {
      lang: api.storage.lang,
      getOption: value => api.settings.get(value),
    },
  });

  app.directive('visible', (el, binding) => {
    el.style.visibility = binding.value ? 'visible' : 'hidden';
  });

  const root = app.mount(rootElement);

  return root;
}

function createStyleTag(styleString: string, name = '') {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.setAttribute('data-name', name);
  const styleText = document.createTextNode(styleString);
  style.appendChild(styleText);
  return style;
}
