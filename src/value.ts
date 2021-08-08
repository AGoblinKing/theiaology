import { DBSchema, openDB } from 'idb'
export const DB_NAME = 'value_db'

export interface IValueDB extends DBSchema {
  value: {
    key: string
    value: string
  }
}

export type ICancel = () => void
export type FSubscribe<T> = (value: T) => any

export const db = openDB<IValueDB>(DB_NAME, 2, {
  upgrade(db): void {
    db.createObjectStore('value')
  },
})

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

  keep(where: string) {
    if (this.stopKeeping) this.stopKeeping()

    this.stopKeeping = this.on(async () =>
      (await db).put('value', JSON.stringify(this.$), where)
    )

    db.then(($db) =>
      $db
        .get('value', where)
        .then((v) => v !== undefined && this.set(JSON.parse(v)))
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
