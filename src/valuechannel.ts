import { DBSchema, openDB } from 'idb'
export const DB_NAME = 'valuechannel_db'

export interface IValueChannelDB extends DBSchema {
  valuechannel: {
    key: string
    value: string
  }
}

export type ICancel = () => void
export type FSubscribe<T> = (value: T) => any

export class Channel {
  protected callbacks: Set<FSubscribe<undefined>>
  on(subscribe: FSubscribe<any>): ICancel {
    if (this.callbacks === undefined) {
      this.callbacks = new Set()
    }

    this.callbacks.add(subscribe)

    return () => this.callbacks.delete(subscribe)
  }

  poke() {
    if (this.callbacks === undefined) return

    for (let callback of this.callbacks) {
      callback(undefined)
    }

    return this
  }

  log(msg) {
    this.on(() => console.log(msg))
    return this
  }
}

export const db = openDB<IValueChannelDB>(DB_NAME, 2, {
  upgrade(db): void {
    db.createObjectStore('valuechannel')
  },
})

export class Value<T> {
  $: T
  protected callbacks: Set<FSubscribe<T>>
  stopKeeping: ICancel

  constructor(value: T = undefined) {
    this.$ = value
  }

  is(value: T) {
    this.$ = value
    this.poke()

    return this
  }

  on(subscribe: FSubscribe<any>): ICancel {
    if (this.callbacks === undefined) {
      this.callbacks = new Set()
    }

    this.callbacks.add(subscribe)

    return () => this.callbacks.delete(subscribe)
  }

  keep(where: string) {
    if (this.stopKeeping) this.stopKeeping()

    this.stopKeeping = this.on(async () =>
      (await db).put('valuechannel', JSON.stringify(this.$), where)
    )

    db.then(($db) =>
      $db
        .get('valuechannel', where)
        .then((v) => v !== undefined && this.is(JSON.parse(v)))
    )

    return this
  }

  log(msg) {
    this.on(() => console.log(msg, this.$))
    return this
  }

  poke() {
    if (this.callbacks === undefined) return

    for (let callback of this.callbacks) {
      callback(this.$)
    }

    return this
  }
}
