export const DB_NAME = 'value'

export type ICancel = () => void
export type FSubscribe<T> = (value: T) => any

export class DB {
  request: IDBRequest
  db: IDBDatabase
  ready: Promise<DB>

  _resolve: any
  constructor() {
    this.ready = new Promise((resolve) => (this._resolve = resolve))
  }

  async put(key: string, value: string) {
    await this.ready
    return this.db
      .transaction(DB_NAME, 'readwrite')
      .objectStore('value')
      .add({ key, value })
  }

  async init() {
    this.request = indexedDB.open(DB_NAME, 1)
    this.request.onerror = this.onerror.bind(this)
    this.request.onsuccess = this.onsuccess.bind(this)
    // @ts-ignore
    this.request.onupgradeneeded = this.onupgradedneeded.bind(this)
    return this.ready
  }
  async get(key: string) {
    await this.ready
    return new Promise((resolve) => {
      return (this.db
        .transaction(DB_NAME, 'readonly')
        .objectStore('value')
        .get(key).onsuccess = (e: any) => {
        resolve(e.target.result)
      })
    })
  }

  onerror(event) {
    console.log("couldn't open the database")
  }
  onsuccess(event) {
    this.db = event.target.result
    this._resolve(this)
  }
  onupgradedneeded(event) {
    this.db = event.target.result
    this.db.createObjectStore('value', {
      keyPath: 'key',
    }).transaction.oncomplete = () => {
      this._resolve(this)
    }
  }
}

const db = new Promise<DB>((resolve) => resolve(new DB().init()))

export class Value<T> {
  $: T
  protected reactions: Set<FSubscribe<T>>
  stopKeeping: ICancel

  constructor(value: T = undefined) {
    this.$ = value
  }

  set(value: T) {
    this.$ = value
    this.poke()

    return this
  }

  on(subscribe: FSubscribe<any>): ICancel {
    if (this.reactions === undefined) {
      this.reactions = new Set()
    }

    this.reactions.add(subscribe)

    subscribe(this.$)
    return () => this.reactions.delete(subscribe)
  }

  subscribe(subscribe: FSubscribe<T>) {
    return this.on(subscribe)
  }

  keep(where: string, callback?: (val: T) => void) {
    if (this.stopKeeping) this.stopKeeping()

    let init = false
    this.stopKeeping = this.on(async () => {
      if (!init) {
        init = true
        return
      }

      ;(await db).put(where, JSON.stringify(this.$))
    })

    db.then(($db) =>
      $db.get(where).then((v: any) => {
        if (v === undefined) return

        switch (v.value) {
          case undefined:
          case '':
            return
        }

        const val = JSON.parse(v.value)
        this.set(val)

        if (callback) callback(val)
      })
    )

    return this
  }

  log(msg) {
    this.on(() => console.log(msg, this.$))
    return this
  }

  poke() {
    if (this.reactions === undefined) return

    for (let callback of this.reactions) {
      callback(this.$)
    }

    return this
  }
}
