export type ICancel = () => void
export type FSubscribe<T> = (value: T) => any

// Why not EventTarget? This is sync
export class Value<T> {
  $: T
  protected ons: Set<FSubscribe<T>>

  constructor(value: T = undefined) {
    this.$ = value
  }

  set(value: T) {
    this.$ = value
    this.poke()

    return this
  }

  on(subscribe: FSubscribe<T>) {
    return this.subscribe(subscribe)
  }

  subscribe(subscribe: FSubscribe<T>) {
    if (this.ons === undefined) {
      this.ons = new Set()
    }

    this.ons.add(subscribe)

    subscribe(this.$)
    return () => this.ons.delete(subscribe)
  }

  poke() {
    if (this.ons === undefined) return

    for (let callback of this.ons) {
      callback(this.$)
    }
    return this
  }
}
