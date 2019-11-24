export function getSyncMode(type = ''){
  var mode = api.settings.get('syncMode');
  //
  if(mode === 'SIMKL' && (type === 'manga' || type.indexOf('/manga/') !== -1)){
    return api.settings.get('syncModeSimkl');
  }
  //
  return mode;
}
