// systems run as their own workers
export class System {
  tickrate: number
  constructor(tickrate: number = (1 / 5) * 1000) {
    // start up worker
    self.onmessage = this.onmessage.bind(this)

    this.tickrate = tickrate
    setInterval(this.tick.bind(this), tickrate)
  }

  onmessage(msg: MessageEvent) {}

  tick() {}
}
