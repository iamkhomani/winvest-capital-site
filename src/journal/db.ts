// IndexedDB storage for the trading journal: one JSON document for the journal and a store
// for screenshots (Blobs). Nothing leaves the visitor's device.
import type { JournalState } from './types'
import { emptyState } from './types'

const DB = 'winvest-journal'
const VERSION = 1

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv')
      if (!db.objectStoreNames.contains('images')) db.createObjectStore('images')
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function tx<T>(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T> | void): Promise<T | undefined> {
  const db = await open()
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode)
    const s = t.objectStore(store)
    const r = fn(s)
    t.oncomplete = () => {
      db.close()
      resolve(r ? (r.result as T) : undefined)
    }
    t.onerror = () => {
      db.close()
      reject(t.error)
    }
  })
}

export async function loadState(): Promise<JournalState> {
  try {
    const v = await tx<JournalState>('kv', 'readonly', (s) => s.get('state'))
    if (v && v.app === 'winvest-journal') return { ...emptyState(), ...v, settings: { ...emptyState().settings, ...v.settings } }
  } catch {
    /* IndexedDB unavailable */
  }
  return emptyState()
}

export async function saveState(state: JournalState): Promise<boolean> {
  try {
    await tx('kv', 'readwrite', (s) => s.put(state, 'state'))
    return true
  } catch {
    return false
  }
}

export async function putImage(id: string, blob: Blob) {
  await tx('images', 'readwrite', (s) => s.put(blob, id))
}
export async function getImage(id: string): Promise<Blob | undefined> {
  try {
    return await tx<Blob>('images', 'readonly', (s) => s.get(id))
  } catch {
    return undefined
  }
}
export async function deleteImage(id: string) {
  await tx('images', 'readwrite', (s) => s.delete(id))
}
export async function allImages(): Promise<Record<string, Blob>> {
  const db = await open()
  return new Promise((resolve, reject) => {
    const out: Record<string, Blob> = {}
    const t = db.transaction('images', 'readonly')
    const req = t.objectStore('images').openCursor()
    req.onsuccess = () => {
      const c = req.result
      if (c) {
        out[String(c.key)] = c.value as Blob
        c.continue()
      }
    }
    t.oncomplete = () => {
      db.close()
      resolve(out)
    }
    t.onerror = () => {
      db.close()
      reject(t.error)
    }
  })
}
export async function clearAll() {
  await tx('kv', 'readwrite', (s) => s.clear())
  await tx('images', 'readwrite', (s) => s.clear())
}

/** Downscale an image file to max 1600 px and JPEG, to keep storage small. */
export async function compressImage(file: Blob, max = 1600): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file)
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height))
    const c = document.createElement('canvas')
    c.width = Math.round(bmp.width * scale)
    c.height = Math.round(bmp.height * scale)
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
    return await new Promise<Blob>((res) => c.toBlob((b) => res(b || file), 'image/jpeg', 0.85))
  } catch {
    return file
  }
}

export const blobToDataUrl = (b: Blob) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(String(r.result))
    r.onerror = () => rej(r.error)
    r.readAsDataURL(b)
  })

export const dataUrlToBlob = async (u: string) => (await fetch(u)).blob()
