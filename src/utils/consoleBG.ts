export var log = (function() {
  return Function.prototype.bind.call(
    console.log,
    console,
    '%cMAL-Sync-BG',
    'background-color: #2e51a2; color: white; padding: 2px 10px; border-radius: 3px;',
  );
})();

export var error = (function() {
  return Function.prototype.bind.call(
    console.error,
    console,
    '%cMAL-Sync-BG',
    'background-color: #8f0000; color: white; padding: 2px 10px; border-radius: 3px;',
  );
})();

export var info = (function() {
  return Function.prototype.bind.call(
    console.info,
    console,
    '%cMAL-Sync-BG',
    'background-color: wheat; color: black; padding: 2px 10px; border-radius: 3px;',
  );
})();
