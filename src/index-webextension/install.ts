import { createApp } from '../utils/Vue';
import main from '../installPage/main.vue';

declare let componentHandler: any;

document.getElementsByTagName('head')[0].onclick = function (e) {
  try {
    componentHandler.upgradeDom();
  } catch (e2) {
    console.log(e2);
    setTimeout(function () {
      componentHandler.upgradeDom();
    }, 500);
  }
};

api.settings.init().then(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const minimalVue = createApp(main, '#app');
});
