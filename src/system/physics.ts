// performs grid traversal and collision detection
import { RBush3D } from 'rbush-3d'
import { Cage } from 'src/buffer/cage'
import { Impact } from 'src/buffer/impact'
import { EPhase, Matter } from 'src/buffer/matter'
import { Size } from 'src/buffer/size'
import { SpaceTime } from 'src/buffer/spacetime'
import { ELandState, Universal } from 'src/buffer/universal'
import { Velocity } from 'src/buffer/velocity'
import { ENTITY_COUNT, NORMALIZER } from 'src/config'
import { Box3, Vector3 } from 'three'
import { EMessage } from './sys-enum'
import { System } from './system'

const $box = new Box3()
const $box2 = new Box3()
const $vec = new Vector3()
const $vec2 = new Vector3()

const sectorBoxCache = {}
// put each
// each sector is indexed here, '442313' is a possible sector
let sectors: { [sectorId: string]: Set<number> } = {}
// ids 2 sector
let ids: { [id: number]: string[] } = {}

class Physics extends System {
  past: SpaceTime
  future: SpaceTime
  matter: Matter
  velocity: Velocity
  size: Size
  impact: Impact
  universal: Universal
  cage: Cage

  // @ts-ignore
  tree = new RBush3D(16, ['[0]', '[1]', '[2]', '[3]', '[4]', '[5]'])
  ready = false
  // 50 frames a second, idealy get this to 5
  constructor() {
    super((1 / 30) * 1000)
  }

  onmessage(e: MessageEvent) {
    switch (undefined) {
      case this.past:
        this.past = new SpaceTime(e.data)
        break
      case this.future:
        this.future = new SpaceTime(e.data)
        break
      case this.matter:
        this.matter = new Matter(e.data)
        break
      case this.velocity:
        this.velocity = new Velocity(e.data)
        break
      case this.size:
        this.size = new Size(e.data)
        break
      case this.impact:
        this.impact = new Impact(e.data)
        break
      case this.universal:
        this.universal = new Universal(e.data)
        break
      case this.cage:
        this.cage = new Cage(e.data)
        this.init()
        break

      default:
        switch (e.data) {
          case EMessage.TIMELINE_UPDATE:
            sectors = {}
            ids = {}
            break
        }
    }
  }

  init() {
    this.ready = true
  }

  // these numbers never change so cache them
  sectorBox(base8: string) {
    if (sectorBoxCache[base8] === undefined) {
      let distance = NORMALIZER

      $vec.set(-NORMALIZER / 2, -NORMALIZER / 2, -NORMALIZER / 2)
      // calc sector based on sid and $sector container

      for (let i = 0; i < base8.length; i++) {
        switch (base8[i]) {
          case '0':
            $vec2.set(1, 1, 1)
            break
          case '1':
            $vec2.set(-1, -1, -1)
            break
          case '2':
            $vec2.set(1, -1, 1)
            break
          case '3':
            $vec2.set(1, 1, -1)
            break
          case '4':
            $vec2.set(-1, 1, -1)
            break
          case '5':
            $vec2.set(-1, -1, 1)
            break
          case '6':
            $vec2.set(1, -1, -1)
            break
          case '7':
            $vec2.set(-1, 1, 1)
            break
        }
        $vec.add($vec2.multiplyScalar(distance))

        distance /= 2
      }

      // move vec$ based on sector and half the size of the container each time
      sectorBoxCache[base8] = new Box3(
        $vec.clone().subScalar(distance * 2),
        $vec.clone().addScalar(distance * 2)
      )
    }
    return sectorBoxCache[base8]
  }

  // these numbers change a bunch so better to just assign them to a tmp
  box(i: number, $bb: Box3 = $box) {
    const sx = this.size.x(i) / 2,
      sy = this.size.y(i) / 2,
      sz = this.size.z(i) / 2,
      x = this.future.x(i),
      y = this.future.y(i),
      z = this.future.z(i)

    // update their sector while you have their data

    $bb.min.set(x - sx, y - sy, z - sz), $bb.max.set(x + sx, y + sy, z + sz)

    return $bb
  }

  // add to the ids sectors, only add to the sector you're most contained in
  sectorize(i: number, $bb?: Box3) {
    if (!$bb) $bb = this.box(i)
    if (ids[i] === undefined) ids[i] = []

    const id_sectors = ids[i]
    const id_sectors_count = id_sectors.length

    let id = ``
    if (id_sectors_count > 0) {
      sectors[id_sectors.pop()]?.delete(i)
      id_sectors.splice(0, id_sectors_count)
    }

    for (let sector_depth = 0; sector_depth < 24; sector_depth++) {
      // check each sector if it contains the point
      let match = false
      for (let s = 0; s < 8; s++) {
        const sid = id + s
        if (this.sectorBox(sid).containsBox($bb)) {
          id_sectors.push(id)
          id = sid
          match = true
          break
        }
      }

      if (!match) {
        if (sectors[id] === undefined) sectors[id] = new Set()
        sectors[id].add(i)
        break
      }
    }

    return id_sectors
  }

  tick() {
    if (!this.ready || this.universal.state() !== ELandState.RUNNING) return

    const t = this.universal.time()

    // rip through matter, update their grid_past/futures
    for (let i = 0; i < ENTITY_COUNT; i++) {
      const phase = this.matter.phase(i)
      switch (phase) {
        case EPhase.STUCK:
          // this.matter.phase(i, EPhase.VOID)
          // add to sectors
          this.sectorize(i)
          continue
      }

      let vx = this.velocity.x(i),
        vy = this.velocity.y(i),
        vz = this.velocity.z(i)

      if (vx !== 0 || vy !== 0 || vz !== 0) {
        let x = this.past.x(i, this.future.x(i))
        let y = this.past.y(i, this.future.y(i))
        let z = this.past.z(i, this.future.z(i))
        this.past.time(i, t)

        switch (phase) {
          case EPhase.VOID:
          case EPhase.GHOST:
            break
          default:
            this.box(i, $box)

            for (let sid of this.sectorize(i)) {
              // go through your sectors and check for collision
              if (!sectors[sid]) continue

              for (let oids of sectors[sid]) {
                this.box(oids, $box2).intersect($box)
                if (oids !== i && !$box2.isEmpty()) {
                  // @ts-ignore
                  $box.getCenter($vec).sub($box2.getCenter($vec2))

                  vx += $vec.x
                  vy += $vec.y
                  vz += $vec.z
                }
              }
            }
        }

        x = this.future.x(i, x + vx)
        y = this.future.y(i, y + vy)
        z = this.future.z(i, z + vz)

        this.future.time(i, t + this.tickrate)

        const cX = this.cage.x(i),
          cY = this.cage.y(i),
          cZ = this.cage.z(i),
          cMX = this.cage.mX(i),
          cMY = this.cage.mY(i),
          cMZ = this.cage.mZ(i)

        const cageX = !(cX === 0 && cMX === 0),
          cageY = !(cY === 0 && cMY === 0),
          cageZ = !(cZ === 0 && cMZ === 0)

        if (cageX) {
          if (x > cMX) {
            this.future.x(i, cX)
          } else if (x < cX) {
            this.future.x(i, cMX)
          }
        }

        if (cageY) {
          if (y > cMY) {
            this.future.y(i, cY)
          } else if (y < cY) {
            this.future.y(i, cMY)
          }
        }

        if (cageZ) {
          if (z > cMZ) {
            this.future.z(i, cZ)
          } else if (z < cZ) {
            this.future.z(i, cMZ)
          }
        }

        // warp out of bounds to other side
      }
    }
  }
}

new Physics()
