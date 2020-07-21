export function floatClick(page) {
  con.log('Open miniMAL');
  chrome.runtime.sendMessage({ name: 'minimalWindow' }, function(response) {
    con.log('Opened')
  });
}
