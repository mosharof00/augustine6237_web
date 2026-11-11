const PENDING_SCHOOL_KEY = "wop.pendingSchool";
const PENDING_EMAIL_KEY = "wop.pendingEmail";

type Store = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function browserStore(): Store {
  return window.sessionStorage;
}

export function markPendingSchool(email: string, storage: Store = browserStore()) {
  storage.setItem(PENDING_SCHOOL_KEY, "1");
  storage.setItem(PENDING_EMAIL_KEY, email.trim());
}

export function readPendingSchool(storage: Store = browserStore()) {
  return storage.getItem(PENDING_SCHOOL_KEY) === "1";
}

export function readPendingEmail(storage: Store = browserStore()) {
  return storage.getItem(PENDING_EMAIL_KEY);
}

export function clearPendingSchool(storage: Store = browserStore()) {
  storage.removeItem(PENDING_SCHOOL_KEY);
}
