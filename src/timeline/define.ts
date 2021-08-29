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
  }

  ripple(what: ERipple, data?: any) {
    for (let c of this._) {
      switch (what) {
        case ERipple.PHASE:
          c.phase = this.phase
          break
        case ERipple.IMPACT:
          c.impact = this.impact
          break
        case ERipple.VOX:
          c.vox = this.vox
          break
        case ERipple.TEXT:
          c.text = this.text
          break
        case ERipple.DOLOOK:
          c.doLook = this.doLook
          break
        case ERipple.VEL:
          c.vel.copy(this.vel)
          break
        case ERipple.VELVAR:
          c.velvar.copy(this.velvar)
          break
        case ERipple.POS:
          c.pos.copy(this.pos)
          break
        case ERipple.POSVAR:
          c.posvar.copy(this.posvar)
          break

        case ERipple.VOXVAR:
          c.voxvar.copy(this.voxvar)
          break
        case ERipple.COL:
          c.col.tilt = this.col.tilt
          c.col.variance = this.col.variance
          break
        case ERipple.FLOCK:
          c.flock.shape = this.flock.shape
          c.flock.size = this.flock.size
          c.flock.step = this.flock.step
          break

        case ERipple.SIZE:
          c.size.copy(this.size)
          break

        case ERipple.SIZEVAR:
          c.sizevar.copy(this.sizevar)
          break

        case ERipple.ROT:
          c.rot.copy(this.rot)
          break

        case ERipple.ROTVAR:
          c.rotvar.copy(this.rotvar)
          break
        case ERipple.COLOR:
          c.color.copy(this.color)
          break
        case ERipple.CAGE:
          c.cage.copy(this.cage)
          break
        case ERipple.POSADD:
          c.pos.add(data)
          break
        case ERipple.VELADD:
          c.vel.add(data)
          break
      }
      c.ripple(what, data)
    }
  }
}
