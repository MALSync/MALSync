import { myAnimePulseOauth } from '../_provider/MyAnimePulse/oauth';

api.settings.init().then(() => {
  myAnimePulseOauth();
});
