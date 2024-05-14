export function script() {
  if (Object.prototype.hasOwnProperty.call(window, 'netflix')) {
    return (window as any).netflix.reactContext;
  }
  return undefined;
}
