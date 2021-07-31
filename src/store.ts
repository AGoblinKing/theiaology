export enum EPokeControls {
  NOTHING = 0,
  BREAK,
}

export type ICancel = () => void
export type FSubscribe<T> = (value: T) => void | EPokeControls

export interface IChannel {
  poke(): IChannel
  on(sub: FSubscribe<any>): ICancel
}

export class Channel implements IChannel {
  protected callbacks: Set<FSubscribe<undefined>>
  public $: any

  on(subscribe: FSubscribe<any>): ICancel {
    if (this.callbacks === undefined) {
      this.callbacks = new Set()
    }

    this.callbacks.add(subscribe)

    return () => this.callbacks.delete(subscribe)
  }

  poke(): IChannel {
    if (this.callbacks === undefined) return

    for (let callback of this.callbacks) {
      const res = callback(this.$)
      if (res === EPokeControls.BREAK) break
    }

    return this
  }
}

export interface IValue<T> extends IChannel {
  is(T): IValue<T>
  poke(): IValue<T>
  log(): IValue<T>
  on(subscribe: FSubscribe<T>): ICancel

  $: T
  persist(where: string): IValue<T>
  session(where: string): IValue<T>
}

export class Value<T> extends Channel implements IValue<T> {
  $: T
  // where to persist
  localLoc: string
  sessionLoc: string

  constructor(value: T = undefined) {
    super()
    this.$ = value
  }

  log() {
    this.on(console.log)
    return this
  }

  is(value: T) {
    this.$ = value
    this.poke()

    return this
  }

  persist(where: string) {
    this.localLoc = where
    const v = localStorage.getItem(where)
    if (v === null) return this

    try {
      if (this.$ instanceof Set) {
        ;(this.$ as Set<any>) = new Set(JSON.parse(v))
      } else {
        switch (typeof this.$) {
          case 'boolean':
          case 'string':
          case 'number':
            this.$ = JSON.parse(v)
            break
          default:
            Object.assign(this.$, JSON.parse(v))
        }
      }
    } catch (ex) {
      console.error(ex)
    }

    return this.is(this.$)
  }

  session(where: string) {
    this.sessionLoc = where
    const v = sessionStorage.getItem(where)
    if (v === null) return this

    try {
      if (this.$ instanceof Set) {
        ;(this.$ as Set<any>) = new Set(JSON.parse(v))
      } else {
        switch (typeof this.$) {
          case 'boolean':
          case 'string':
          case 'number':
            this.$ = JSON.parse(v)
            break
          default:
            Object.assign(this.$, JSON.parse(v))
        }
      }
    } catch (ex) {
      console.error(ex)
    }

    return this.is(this.$)
  }

  poke(): IValue<T> {
    super.poke()
    if (this.localLoc) {
      if (this.$ instanceof Set) {
        localStorage.setItem(this.localLoc, JSON.stringify([...this.$]))
      } else {
        localStorage.setItem(this.localLoc, JSON.stringify(this.$))
      }
      if (this.sessionLoc) {
        if (this.$ instanceof Set) {
          sessionStorage.setItem(this.sessionLoc, JSON.stringify([...this.$]))
        } else {
          sessionStorage.setItem(this.sessionLoc, JSON.stringify(this.$))
        }
      }
    }
    return this
  }
}
