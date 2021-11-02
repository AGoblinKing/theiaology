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
    // never gonna make you cry
    fn()
    return this
  }
  re(fn: (value: T) => void) {
    // never gonna give you up
    this.on(fn)

    return this
  }
  me() {
    return new Value(this.$)
  }
  fa<TT>(
    v: Value<TT>,
    transform?: (value: TT) => T,
    filter?: (value: TT) => boolean
  ) {
    // let you down
    v.on((state) => {
      if (filter) {
        if (!filter(state)) return
      }
      if (transform) {
        this.set(transform(state))
      } else {
        // @ts-ignore
        this.set(state)
      }
    })

    return this
  }
  la(timing: number, fn: (i: number) => void) {
    // never gonna turn around
    let i = 0
    setInterval(() => {
      fn(i++)
    }, timing)

    return this
  }

  save(where: string) {
    // or desert you?
    try {
      const v = JSON.parse(localStorage.getItem(where))

      if (v !== undefined && v !== null) {
        this.set(v)
      }
    } catch (ex) {}

    this.on((v) => {
      localStorage.setItem(where, JSON.stringify(v))
    })
    return this
  }
}
