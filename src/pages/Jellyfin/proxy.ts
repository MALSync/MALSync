export function script() {
  if (Object.prototype.hasOwnProperty.call(window, 'ApiClient')) {
    return (window as any).ApiClient;
  }
  return undefined;
}
