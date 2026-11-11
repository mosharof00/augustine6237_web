export function goToApp(path: string) {
  const destination = new URL(path, window.location.origin);
  window.location.assign(destination.href);
}
