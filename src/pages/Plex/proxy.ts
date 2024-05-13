export function script() {
  if (Object.prototype.hasOwnProperty.call(window, 'localStorage')) {
    return {
      apiKey: window.localStorage.myPlexAccessToken,
      users: window.localStorage.users,
    };
  }
  return undefined;
}
