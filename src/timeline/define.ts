import { EPhase } from 'src/buffer/matter'
import { Box3, Color, Euler, Vector3 } from 'three'
import { EImpactReaction, EShape } from './def-timeline'

export enum ERipple {
  PHASE,
  IMPACT,
  VOX,
  LOOK,
  DOLOOK,
  TEXT,
  COL,
  FLOCK,
  POSVAR,
  SIZEVAR,
  VOXVAR,
  COLOR,
  VEL,
  VELVAR,
  SIZE,
  POS,
  ROT,
  ROTVAR,
  POSADD,
  VELADD,
  CAGE,
  DEREZ,
}

export class Define {
  color = new Color()
  pos = new Vector3()
  rot = new Euler()
  rotvar = new Euler()
  size = new Vector3()
  col = { tilt: 0, variance: 0 }
  vox = ''
  voxvar = new Vector3()
  sizevar = new Vector3()
  posvar = new Vector3()
  flock: { shape: EShape; size: number; step: number }
  look = new Vector3()
  impact = EImpactReaction.None
  phase = EPhase.VOID
  vel = new Vector3()
  velvar = new Vector3()
  text: string
  cage = new Box3()

  doLook = false

  // do not reset to let rezes linger
  atoms: number[] = []

  // subdefines
  _: Define[] = []
  dirty: Set<ERipple>

  constructor() {
    this.reset()
  }

  all() {
    return [
      ...this.atoms,
      ...this._.reduce((a, i) => [...a, ...this.atoms], []),
    ]
  }

  reset() {
    this.phase = EPhase.GHOST
    this.impact = EImpactReaction.None
    this.vel.set(0, 0, 0)
    this.velvar.set(0, 0, 0)
    this.color.setRGB(1, 1, 1)
    this.pos.set(0, 0, 0)
    this.rot.set(0, 0, 0)
    this.rotvar.set(0, 0, 0)
    this.voxvar.set(0, 0, 0)
    this.size.set(1, 1, 1)
    this.vox = ''
    this.col.tilt = 0
    this.col.variance = 0

    this.sizevar.set(0, 0, 0)
    this.look.set(0, 0, 0)

    this.posvar.set(0, 0, 0)
    this.flock = { shape: EShape.Plane, size: 1, step: 0 }
    this.doLook = false
    this.text = undefined
    this.atoms = []
    this._ = []
    this.dirty = new Set()
  }

  ripple(what: ERipple, data: any, mark = true) {
    if (mark) this.dirty.add(what)

    for (let c of this._) {
      if (c.dirty.has(what)) continue
      c.ripple(what, data, false)

      switch (what) {
        case ERipple.PHASE:
          c.phase = data
          break
        case ERipple.IMPACT:
          c.impact = data
          break
        case ERipple.VOX:
          c.vox = data
          break
        case ERipple.TEXT:
          c.text = data
          break
        case ERipple.DOLOOK:
          c.doLook = data
          break
        case ERipple.VEL:
          c.vel.copy(data)
          break
        case ERipple.VELVAR:
          c.velvar.copy(data)
          break
        case ERipple.POS:
          c.pos.copy(data)
          break
        case ERipple.POSVAR:
          c.posvar.copy(data)
          break

        case ERipple.VOXVAR:
          c.voxvar.copy(data)
          break
        case ERipple.COL:
          c.col.tilt = data.tilt
          c.col.variance = data.variance
          break
        case ERipple.FLOCK:
          c.flock.shape = data.shape
          c.flock.size = data.size
          c.flock.step = data.step
          break

        case ERipple.SIZE:
          c.size.copy(data)
          break

        case ERipple.SIZEVAR:
          c.sizevar.copy(data)
          break

        case ERipple.ROT:
          c.rot.copy(data)
          break

        case ERipple.ROTVAR:
          c.rotvar.copy(data)
          break
        case ERipple.COLOR:
          c.color.copy(data)
          break
        case ERipple.CAGE:
          c.cage.copy(data)
          break
        case ERipple.POSADD:
          c.pos.add(data)
          break
        case ERipple.VELADD:
          c.vel.add(data)
          break
        case ERipple.DEREZ:
          for (let atom of this.atoms) {
            data.free(atom)
          }
          this.atoms = []
          break
      }
    }
  }
}
