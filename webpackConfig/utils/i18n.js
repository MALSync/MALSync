const i18n = require('./../../assets/_locales/en/messages.json');

module.exports = function(){
  var tempi18n = {};
  for(var i in i18n) {
    var lEl = i18n[i];
    var message = lEl.message;
    if(typeof lEl.placeholders !== 'undefined'){
      for(var index in lEl.placeholders) {

        var placeholder = lEl.placeholders[index];
        var pContent = placeholder.content;

        message = message.replace("$"+index+"$", pContent);
      }
    }
    tempi18n[i] = message;
  }
  return tempi18n;
}
