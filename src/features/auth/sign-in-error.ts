let pendingSignInError: string | null = null;

export function rememberSignInError(message: string) {
  pendingSignInError = message;
  window.setTimeout(() => {
    if (pendingSignInError === message) pendingSignInError = null;
  }, 2000);
}

export function readSignInError() {
  return pendingSignInError;
}
