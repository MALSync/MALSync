import { animeoshiOauth } from '../animeoshi/oauth';

api.settings.init().then(() => {
  animeoshiOauth();
});
