// systems run as their own workers
export class System {
  constructor(tickrate: number = (1 / 5) * 1000) {
    // start up worker
    self.onmessage = this.onmessage.bind(this)

    setInterval(this.tick.bind(this), tickrate)
  }

  onmessage(msg: MessageEvent) {}

  tick() {}
}
