export async function firebaseNotification() {
  const schedule = await api.storage.get('timestampUpdate/firebaseNotification');
  if (typeof schedule === 'undefined' || j.$.now() - schedule > 10 * 60 * 1000) {
    await checkNotifications();
    api.storage.set('timestampUpdate/firebaseNotification', j.$.now());
  }
}

async function checkNotifications() {
  con.log('checkNotifications');
  const url = 'https://kissanimelist.firebaseio.com/Data2/Notification/Current.json';
  const response = await api.request.xhr('GET', url);
  const current = parseInt(JSON.parse(response.responseText));
  if (Number.isNaN(current)) con.error('Could not read current Notification number');

  con.log('Current Notification', current);
  const last = parseInt(await api.storage.get('firebaseNotification'));
  const next = last + 1;

  if (typeof last === 'undefined' || Number.isNaN(last)) {
    api.storage.set('firebaseNotification', current);
    return;
  }

  if (current < next) {
    con.log('No new notifications');

    return;
  }

  const notificationUrl = `https://kissanimelist.firebaseio.com/Data2/Notification/list/N${next}.json`;
  const resNotification = await api.request.xhr('GET', notificationUrl);

  if (!resNotification) return;

  const message = JSON.parse(resNotification.responseText);
  if (!message) {
    con.info('Notification empty', resNotification.responseText);
    api.storage.set('firebaseNotification', next).then(function() {
      checkNotifications();
    });

    return;
  }

  j.$(document).ready(function() {
    const flashm = utils.flashm(
      `<div style="text-align: left;">${message}</div><button class="okChangelog" style="background-color: transparent; border: none; color: rgb(255,64,129);margin-top: 10px;cursor: pointer;">Close</button>`,
      { permanent: true, position: 'top' },
    );
    flashm.find('.okChangelog').click(function() {
      flashm.remove();
      api.storage.set('firebaseNotification', next).then(function() {
        checkNotifications();
      });
    });
  });
}
