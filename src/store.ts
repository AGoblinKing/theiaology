
export type ICancel = () => void

export interface IStore<T> extends Promise<T> {
  set(T)
  is(T)
  get(): T
  react(subscribe: (value: T) => void)

  transform(subscribe: (value: T, prev: T) => T): IStore<T>
  on(subscribe: (value: T) => void, ignoreInitial?: boolean): ICancel
  poke()
  subscribe(subscribe: (value: T) => void): ICancel
  log()

 
  $: T
}


export interface IValue<T> extends IStore<T> {
  persist(where: string): IValue<T>
  session(where: string): IValue<T>
  derive<D>(store: IStore<D>, transform: (other: D) => T): IValue<T>
}

export class Read<T> implements IStore<T> {
  $: T
  callbacks: Set<(T) => void>
  first: boolean
  _transform: (value: T, prev: T) => T

  constructor(value: T) {
    this.first = true
    this.$ = value
  }
  transform(subscribe: (value: T, prev: T) => T): Read<T> {
    this._transform = subscribe

    return this
  }
  react(subscribe: (value: T) => void) {
    if (this.callbacks === undefined) {
      this.callbacks = new Set()
    }

    this.callbacks.add(subscribe)
    subscribe(this.get())
    return this
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: (value: T) => TResult1 | PromiseLike<TResult1>,
    onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>
  ): Promise<TResult1 | TResult2> {
    if (!this.first) {
      onfulfilled(this.get())
      return
    }
    const cancel = this.subscribe(($value) => {
      if (this.first) return

      cancel()
      onfulfilled($value)
    })

    return
  }

  catch<TResult = never>(
    onrejected?: (reason: any) => TResult | PromiseLike<TResult>
  ): Promise<T | TResult> {
    return this
  }
  [Symbol.toStringTag]: string
  finally(onfinally?: () => void): Promise<T> {
    return this
  }

  get(): T {
    return this.$
  }

  // set alias, trying out more semantic coding
  is(value: T) {
    return this.set(value)
  }

  on(subscribe: (value: T) => void, ignoreInitial = false): ICancel {
    return this.subscribe(subscribe, ignoreInitial)
  }

  poke() {
    if (this.callbacks === undefined) return

    for (let callback of this.callbacks) {
      callback(this.get())
    }

    return this
  }

  set(value: T) {
    if (this._transform !== undefined) {
      value = this._transform(value, this.$)
    }
    this.first = false
    this.$ = value
    this.poke()

    return this
  }

  subscribe(callback, ignoreInitial = false) {
    if (this.callbacks === undefined) {
      this.callbacks = new Set()
    }

    this.callbacks.add(callback)
    if (!ignoreInitial) callback(this.get())

    return () => this.callbacks.delete(callback)
  }

  log() {
    return this.on(console.log)
  }
}

export class Value<T> extends Read<T> implements IValue<T> {
  // where to persist
  where: string
  swhere: string

  derive<D>(store: IStore<D>, transform: (other: D) => T) {
    requestAnimationFrame(() => {
      store.on(($store) => {
        this.is(transform($store))
      })
    })

    return this
  }

  persist(where: string) {
    this.where = where
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

 
    return this.set(this.$)
  }

  session(where: string) {
    this.swhere = where
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


    return this.set(this.$)
  }

  poke() {
    super.poke()
    if (this.where) {
      if (this.$ instanceof Set) {
        localStorage.setItem(this.where, JSON.stringify([...this.$]))
      } else {
        localStorage.setItem(this.where, JSON.stringify(this.$))
      }
      if (this.swhere) {
        if (this.$ instanceof Set) {
          sessionStorage.setItem(this.swhere, JSON.stringify([...this.$]))
        } else {
          sessionStorage.setItem(this.swhere, JSON.stringify(this.$))
        }
      }
    }
    return this
  }
}
