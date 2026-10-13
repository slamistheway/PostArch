const listeners = new Set<() => void>();

export function subscribeToSaveChanges(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function notifySaveChanged() {
  for (const listener of listeners) listener();
}
