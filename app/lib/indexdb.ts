// IndexedDB utility for cart management

const DB_NAME = "ShopDB"
const STORE_NAME = "cart"
const DB_VERSION = 1

export interface CartItem {
  id: string // product ID
  productName: string
  price: number
  quantity: number
  selectedVariant?: {
    name: string
    value: string
  }
  image: string
}

let db: IDBDatabase | null = null

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" })
      }
    }
  })
}

export const addToCart = async (item: CartItem): Promise<void> => {
  const database = await initDB()
  const transaction = database.transaction([STORE_NAME], "readwrite")
  const store = transaction.objectStore(STORE_NAME)

  return new Promise((resolve, reject) => {
    const request = store.put(item)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export const getCartItems = async (): Promise<CartItem[]> => {
  const database = await initDB()
  const transaction = database.transaction([STORE_NAME], "readonly")
  const store = transaction.objectStore(STORE_NAME)

  return new Promise((resolve, reject) => {
    const request = store.getAll()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

export const removeFromCart = async (productId: string): Promise<void> => {
  const database = await initDB()
  const transaction = database.transaction([STORE_NAME], "readwrite")
  const store = transaction.objectStore(STORE_NAME)

  return new Promise((resolve, reject) => {
    const request = store.delete(productId)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export const updateCartItem = async (item: CartItem): Promise<void> => {
  const database = await initDB()
  const transaction = database.transaction([STORE_NAME], "readwrite")
  const store = transaction.objectStore(STORE_NAME)

  return new Promise((resolve, reject) => {
    const request = store.put(item)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export const clearCart = async (): Promise<void> => {
  const database = await initDB()
  const transaction = database.transaction([STORE_NAME], "readwrite")
  const store = transaction.objectStore(STORE_NAME)

  return new Promise((resolve, reject) => {
    const request = store.clear()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}
