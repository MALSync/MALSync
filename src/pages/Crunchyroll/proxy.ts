import { ScriptProxyWrapper } from '../../utils/scriptProxy';

ScriptProxyWrapper(() => {
  if (Object.prototype.hasOwnProperty.call(window, '__APP_CONFIG__')) {
    return (window as any).__APP_CONFIG__.cxApiParams;
  }
  return undefined;
});
