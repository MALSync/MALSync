import { oauth } from '../utils/oauth';

api.settings.init().then(() => {
  oauth();
});
