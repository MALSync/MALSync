import { createApp as vueCreateApp, Component } from 'vue';
import VueDOMPurifyHTML from 'vue-dompurify-html';

export function createApp(component, selector: string) {
  const app = vueCreateApp(component);
  app.use(VueDOMPurifyHTML, { default: { ADD_ATTR: ['target'] } });
  const root = app.mount(selector);

  // inject Styles
  if (component.styles) {
    const style = document.createElement('style');
    style.type = 'text/css';
    const styleText = document.createTextNode(component.styles);
    style.appendChild(styleText);
    root.$el.after(style);
  }

  return root;
}
