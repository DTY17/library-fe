// Generic localStorage-backed CRUD helper.
// Nothing in this file talks to a backend — everything lives in the
// browser's localStorage under the given key.

type WithId = { id: string };

export const generateId = (): string => {
  const withRandomUUID = globalThis.crypto as Crypto | undefined;
  if (withRandomUUID?.randomUUID) return withRandomUUID.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

function readAll<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch (err) {
    console.error(`Failed to read "${key}" from localStorage:`, err);
    return [];
  }
}

function writeAll<T>(key: string, items: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (err) {
    console.error(`Failed to write "${key}" to localStorage:`, err);
    throw err;
  }
}

export function getAll<T>(key: string): T[] {
  return readAll<T>(key);
}

export function addItem<T extends WithId>(key: string, item: Omit<T, "id">): T {
  const items = readAll<T>(key);
  const newItem = { ...(item as object), id: generateId() } as T;
  writeAll(key, [...items, newItem]);
  return newItem;
}

export function updateItem<T extends WithId>(
  key: string,
  id: string,
  patch: Partial<T>
): T | null {
  const items = readAll<T>(key);
  let updated: T | null = null;

  const next = items.map((it) => {
    if (it.id === id) {
      updated = { ...it, ...patch };
      return updated;
    }
    return it;
  });

  if (!updated) {
    console.error(`No item with id "${id}" found in "${key}"`);
    return null;
  }

  writeAll(key, next);
  return updated;
}

export function deleteItem<T extends WithId>(key: string, id: string): void {
  const items = readAll<T>(key);
  writeAll(
    key,
    items.filter((it) => it.id !== id)
  );
}

// Reads a File as a base64 data URL — used in place of the backend's
// upload endpoint, since there's nowhere to POST the file to.
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}