import { anilistOauth } from '../anilist/oauth';

api.settings.init().then(() => {
  anilistOauth();
});
