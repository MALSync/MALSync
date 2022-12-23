import { shikiOauth } from '../_provider/Shikimori/oauth';

api.settings.init().then(() => {
  shikiOauth();
});
