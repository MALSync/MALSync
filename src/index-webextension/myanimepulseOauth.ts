import { myAnimePulseOauth } from '../_provider/AnimePulse/oauth';

api.settings.init().then(() => {
  myAnimePulseOauth();
});
