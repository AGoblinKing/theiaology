export type ICancel = () => void
export type FSubscribe<T> = (value: T) => any

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

  on(subscribe: FSubscribe<T>): ICancel {
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

  do(fn: () => void) {
    // do the fn later
    setTimeout(() => fn())
    return this
  }
  re(fn: (value: T) => void) {
    // never gonna give you up
    this.on(fn)

    return this
  }
}
