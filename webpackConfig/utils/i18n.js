const i18n = require('../../assets/_locales/en/messages.json');

module.exports = function() {
  const tempi18n = {};
  for (const i in i18n) {
    const lEl = i18n[i];
    let { message } = lEl;
    if (typeof lEl.placeholders !== 'undefined') {
      for (const index in lEl.placeholders) {
        const placeholder = lEl.placeholders[index];
        const pContent = placeholder.content;

        message = message.replace(`$${index}$`, pContent);
      }
    }
    tempi18n[i] = message;
  }
  return tempi18n;
};
