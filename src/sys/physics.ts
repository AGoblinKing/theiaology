// performs grid traversal and collision detection
import { AtomicBuffer } from 'src/atomic'
import { EPhase } from 'src/buffer/matter'
import { System } from './system'

// TODO: split into sectors to go across multiple workers

class Physics extends System {
  past: AtomicBuffer
  future: AtomicBuffer
  matter: AtomicBuffer

  onmessage(e: MessageEvent) {
    super.onmessage(e)
    if (!this.past) {
      this.past = new AtomicBuffer(new Int32Array(e.data))
    } else if (!this.future) {
      this.future = new AtomicBuffer(new Int32Array(e.data))
    } else {
      this.matter = new AtomicBuffer(new Int32Array(e.data))
    }
  }

  backToTheFuture(ix4: number) {
    this.past.set(ix4, this.future.get(ix4))
    this.past.set(ix4 + 1, this.future.get(ix4 + 1))
    this.past.set(ix4 + 2, this.future.get(ix4 + 2))
    this.past.set(ix4 + 3, this.future.get(ix4 + 3))
  }

  tick() {
    if (!this.matter) return

    // rip through matter, update their grid_past/futures
    for (let i = 0; i < this.matter.$.length / 3; i++) {
      if (this.matter.get(i * 3) === EPhase.SKIP) continue

      // got our selves a livin' body
      // resolve their future to the past
      this.backToTheFuture(i * 4)
    }
  }
}

const sys = new Physics()
