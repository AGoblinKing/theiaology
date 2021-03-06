import { AtomicByte } from 'src/buffer/atomic'
import { ATOM_COUNT } from 'src/config'

export enum EStatus {
  Unassigned = 0,
  Assigned,
}

export enum ERole {
  NONE = 0,
  HUNTER,
  SEEKER,
}

export class Traits extends AtomicByte {
  static COUNT = 2

  constructor(buffer = new SharedArrayBuffer(ATOM_COUNT * Traits.COUNT)) {
    super(buffer)
  }

  status(i: number, status?: EStatus): EStatus {
    return status === undefined
      ? Atomics.load(this, i * Traits.COUNT)
      : Atomics.store(this, i * Traits.COUNT, status)
  }

  role(i: number, role?: ERole): ERole {
    return role === undefined
      ? Atomics.load(this, i * Traits.COUNT + 1)
      : Atomics.store(this, i * Traits.COUNT + 1, role)
  }
}
