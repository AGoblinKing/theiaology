import { SystemWorker } from './sys'

// systems run as their own workers
export class System {
  tickrate: number
  constructor(tickrate: number = (1 / 5) * 1000) {
    // start up worker
    self.onmessage = this.onmessage.bind(this)

    this.tickrate = tickrate
    if (tickrate === 0) return
    setInterval(this.tick.bind(this), tickrate)
  }

  onmessage(msg: MessageEvent) {}

  post(data: any) {
    self.postMessage(data, undefined)
  }

  tick() {}
}

export class LocalSystem {
  tickrate: number
  constructor(tickrate: number = (1 / 5) * 1000) {
    this.tickrate = tickrate
    if (tickrate === 0) return
    setInterval(this.tick.bind(this), tickrate)
  }

  onmessage(msg: { data: any }) {}

  post(data: any) {}

  tick() {}

  send(...stuff: any[]) {
    for (let item of stuff) {
      this.onmessage({ data: item })
    }
    return this
  }

  bind(sys: SystemWorker) {
    sys.msg.on((data) => {
      switch (typeof data) {
        case 'number':
          this.onmessage({ data })
          break
      }
    })
    return this
  }
}
