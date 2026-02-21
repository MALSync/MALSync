import { mangabakaOauth } from '../mangabaka/oauth';

api.settings.init().then(() => {
  mangabakaOauth();
});
