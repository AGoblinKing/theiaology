import { AtomicInt } from 'src/buffer/atomic'
import { UNIVERSALS } from 'src/config'
import { EIdle } from 'src/fate/weave'
import { Box3, Vector3 } from 'three'

const $cage = new Box3()
const $offset = new Vector3()

export enum ERealmState {
  PAUSED = 0,
  RUNNING,
}

export class Universal extends AtomicInt {
  static COUNT = 23
  _init = false

  constructor(shared = new SharedArrayBuffer(4 * Universal.COUNT)) {
    super(shared)
    this.reset()
  }

  reset() {
    for (let i = 0; i < UNIVERSALS.length; i++) {
      this.store(i, UNIVERSALS[i])
    }
    this._init = true
    return this
  }

  time(t?: number) {
    return t === undefined ? Atomics.load(this, 0) : Atomics.store(this, 0, t)
  }

  userSize(size?: number) {
    return size === undefined
      ? Atomics.load(this, 1)
      : Atomics.store(this, 1, size)
  }

  idle(idle?: EIdle) {
    return idle === undefined
      ? Atomics.load(this, 2)
      : Atomics.store(this, 2, idle)
  }

  clearColor(color?: number) {
    return color === undefined
      ? Atomics.load(this, 3)
      : Atomics.store(this, 3, color)
  }

  userX(x?: number) {
    return x === undefined ? Atomics.load(this, 4) : Atomics.store(this, 4, x)
  }

  userY(y?: number) {
    return y === undefined ? Atomics.load(this, 5) : Atomics.store(this, 5, y)
  }

  userZ(z?: number) {
    return z === undefined ? Atomics.load(this, 6) : Atomics.store(this, 6, z)
  }

  musicTime(t?: number) {
    return t === undefined ? Atomics.load(this, 7) : Atomics.store(this, 7, t)
  }

  userRX(rx?: number) {
    return rx === undefined ? Atomics.load(this, 8) : Atomics.store(this, 8, rx)
  }

  userRY(ry?: number) {
    return ry === undefined ? Atomics.load(this, 9) : Atomics.store(this, 9, ry)
  }
  userRZ(rz?: number) {
    return rz === undefined
      ? Atomics.load(this, 10)
      : Atomics.store(this, 10, rz)
  }

  cageX(x?: number) {
    return x === undefined ? Atomics.load(this, 11) : Atomics.store(this, 11, x)
  }
  cageY(y?: number) {
    return y === undefined ? Atomics.load(this, 12) : Atomics.store(this, 12, y)
  }
  cageZ(z?: number) {
    return z === undefined ? Atomics.load(this, 13) : Atomics.store(this, 13, z)
  }
  cageMX(mx?: number) {
    return mx === undefined
      ? Atomics.load(this, 14)
      : Atomics.store(this, 14, mx)
  }
  cageMY(my?: number) {
    return my === undefined
      ? Atomics.load(this, 15)
      : Atomics.store(this, 15, my)
  }
  cageMZ(mz?: number) {
    return mz === undefined
      ? Atomics.load(this, 16)
      : Atomics.store(this, 16, mz)
  }

  offsetX(x?: number) {
    return x === undefined ? Atomics.load(this, 17) : Atomics.store(this, 17, x)
  }
  offsetY(y?: number) {
    return y === undefined ? Atomics.load(this, 18) : Atomics.store(this, 18, y)
  }
  offsetZ(z?: number) {
    return z === undefined ? Atomics.load(this, 19) : Atomics.store(this, 19, z)
  }

  offset(offset?: Vector3) {
    if (offset === undefined) {
      $offset.set(this.offsetX(), this.offsetY(), this.offsetZ())
      return $offset
    } else {
      this.offsetX(offset.x)
      this.offsetY(offset.y)
      this.offsetZ(offset.z)
      return offset
    }
  }

  cage(cage?: Box3) {
    if (cage === undefined) {
      $cage.min.set(this.cageX(), this.cageY(), this.cageZ())
      $cage.max.set(this.cageMX(), this.cageMY(), this.cageMZ())
      return $cage
    } else {
      this.cageX(cage.min.x)
      this.cageY(cage.min.y)
      this.cageZ(cage.min.z)
      this.cageMX(cage.max.x)
      this.cageMY(cage.max.y)
      this.cageMZ(cage.max.z)
      return cage
    }
  }

  state(state?: ERealmState) {
    return state === undefined
      ? Atomics.load(this, 20)
      : Atomics.store(this, 20, state)
  }

  avatar(avatar?: number) {
    return avatar === undefined
      ? Atomics.load(this, 21)
      : Atomics.store(this, 21, avatar)
  }

  thrustStrength(strength?: number) {
    return strength === undefined
      ? Atomics.load(this, 22)
      : Atomics.store(this, 22, strength)
  }
}
