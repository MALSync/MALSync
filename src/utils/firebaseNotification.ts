export async function firebaseNotification(){
  var schedule = await api.storage.get('timestampUpdate/firebaseNotification');
  if(typeof schedule === 'undefined' || (j.$.now() - schedule) > 10*60*1000){
    checkNotifications();
    api.storage.set('timestampUpdate/firebaseNotification', j.$.now());
  }
}



function checkNotifications(){
  con.log('checkNotifications');
  var url = 'https://kissanimelist.firebaseio.com/Data2/Notification/Current.json';
  api.request.xhr('GET', url).then(async (response) => {
    var current = parseInt(JSON.parse(response.responseText));
    if(!isNaN(current)){
      con.log("Current Notification", current);
      var last = parseInt(await api.storage.get('firebaseNotification'));
      var next = last + 1;
      if(typeof last == undefined || isNaN(last)){
        //todo: Temporary
        api.storage.set('firebaseNotification', 1);
        //api.storage.set('firebaseNotification', current);
        return;
      }
      if(current >= next){
        var notificationUrl = 'https://kissanimelist.firebaseio.com/Data2/Notification/list/N'+ next+'.json';
        api.request.xhr('GET', notificationUrl).then(async (response) => {
          var message = JSON.parse(response.responseText);
          if(message != 'null' && message != null){
            j.$(document).ready(function(){
              var flashm = utils.flashm(
                '<div style="text-align: left;">'+message+'</div><button class="okChangelog" style="background-color: transparent; border: none; color: rgb(255,64,129);margin-top: 10px;cursor: pointer;">Close</button>',
                {permanent: true, position: "top"}
              )
              flashm.find('.okChangelog').click(function(){
                flashm.remove();
                api.storage.set('firebaseNotification', next).then(function(){
                  checkNotifications();
                });
              })
            });
          }else{
            con.info('Notification empty', response.responseText);
            api.storage.set('firebaseNotification', next).then(function(){
              checkNotifications();
            });
          }

        });
      }else{
        con.log('No new notifications');
      }
    }else{
      con.error('Could not read current Notification number')
    }

  });
}
