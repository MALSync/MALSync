export let log = (function() {
  return Function.prototype.bind.call(
    console.log,
    console,
    '%cMAL-Sync',
    'background-color: #2e51a2; color: white; padding: 2px 10px; border-radius: 3px;',
  );
})();

export let error = (function() {
  return Function.prototype.bind.call(
    console.error,
    console,
    '%cMAL-Sync',
    'background-color: #8f0000; color: white; padding: 2px 10px; border-radius: 3px;',
  );
})();

export let info = (function() {
  return Function.prototype.bind.call(
    console.info,
    console,
    '%cMAL-Sync',
    'background-color: wheat; color: black; padding: 2px 10px; border-radius: 3px;',
  );
})();
