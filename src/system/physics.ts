// performs grid traversal and collision detection
import { Impact } from 'src/buffer/impact'
import { EPhase, Matter } from 'src/buffer/matter'
import { Size } from 'src/buffer/size'
import { SpaceTime } from 'src/buffer/spacetime'
import { Universal } from 'src/buffer/universal'
import { Velocity } from 'src/buffer/velocity'
import { ENTITY_COUNT, NORMALIZER } from 'src/config'
import { Box3, Vector3 } from 'three'
import { EMessage } from './sys-enum'
import { System } from './system'

const $box = new Box3()
const $box2 = new Box3()
const $box3 = new Box3()

const SECTORS = {
  ALPHA: new Vector3(-1, -1, -1),
  BETA: new Vector3(-1, -1, 1),
  GAMMA: new Vector3(-1, 1, 1),
  DELTA: new Vector3(1, 1, 1),
  EPSILON: new Vector3(1, -1, 1),
  ZETA: new Vector3(1, -1, -1),
  ETA: new Vector3(1, 1, -1),
  THETA: new Vector3(-1, 1, -1),
}

const SECTORSA = Object.values(SECTORS)
const sectorBoxCache = {}
// put each
// each sector is indexed here, '442313' is a possible sector
let sectors: { [sectorId: number]: Set<number> } = {}
// ids 2 sector
let ids: { [id: number]: number[] } = {}

// physics bounds, really big bounding box to start
const $sector = new Box3(
  new Vector3(-NORMALIZER / 2, -NORMALIZER / 2, -NORMALIZER / 2),
  new Vector3(NORMALIZER, NORMALIZER, NORMALIZER)
)

class Physics extends System {
  past: SpaceTime
  future: SpaceTime
  matter: Matter
  velocity: Velocity
  size: Size
  impact: Impact
  universal: Universal

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
        this.init()
        break

      default:
        switch (e.data) {
          case EMessage.CAGE_UPDATE:
            this.resetBounds()
            break
          case EMessage.TIMELINE_UPDATE:
            sectors = {}
            ids = {}
            break
        }
    }
  }

  init() {
    this.ready = true
    this.resetBounds()
  }

  resetBounds() {
    $sector.min.set(
      this.universal.minX(),
      this.universal.minY(),
      this.universal.minZ()
    )
    $sector.max.set(
      this.universal.maxX(),
      this.universal.maxY(),
      this.universal.maxZ()
    )
  }

  collide(id1: number, id2: number) {
    // get their x y z and sizes and compare
    return this.box(id1, $box).intersectsBox(this.box(id2, $box2))
  }

  // these numbers never change so cache them
  sectorBox(sid: number) {
    if (sectorBoxCache[sid] === undefined) {
      // calc sector based on sid and $sector container
      sectorBoxCache[sid] = new Box3(new Vector3(), new Vector3())
    }
    return sectorBoxCache[sid]
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
    const eid = ids[i]
    const elen = eid.length
    if (
      eid[elen - 1] !== undefined &&
      this.sectorBox(eid[elen - 1]).containsBox($bb)
    ) {
      // didn't change sectors no need to update
      // TODO: This could cause a bug if something becomes smaller and doesn't change sectors
      return
    }

    let id = 0
    if (elen > 0) {
      sectors[eid.pop()]?.delete(i)
      eid.splice(0, elen)
    }

    for (let sector_depth = 0; sector_depth < 4; sector_depth++) {
      // check each sector if it contains the point
      let match = false
      for (let s = 0; s < 8; s++) {
        const sid = id + s * Math.pow(8, sector_depth)
        if (this.sectorBox(sid).containsBox($bb)) {
          eid.push(id)
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

    return eid
  }

  tick() {
    if (!this.ready) return

    const t = this.universal.time()

    // rip through matter, update their grid_past/futures
    for (let i = 0; i < ENTITY_COUNT; i++) {
      switch (this.matter.phase(i)) {
        case EPhase.VOID:
          continue
        case EPhase.STUCK:
          this.matter.phase(i, EPhase.VOID)
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

        let collisions = 0
        for (let sid of this.sectorize(i)) {
          // go through your sectors and check for collision
          if (!sectors[sid]) continue

          for (let oids of sectors[sid]) {
            if (oids !== i && this.collide(oids, i)) {
              collisions++
              break
            }
          }
          if (collisions > 0) {
            break
          }
        }

        if (collisions === 0) {
          x = this.future.x(i, x + vx)
          y = this.future.y(i, y + vy)
          z = this.future.z(i, z + vz)

          this.future.time(i, t + this.tickrate + 500)

          if (x > $sector.max.x) {
            this.future.x(i, $sector.min.x)
          } else if (x < $sector.min.x) {
            this.future.x(i, $sector.max.x)
          }

          if (y > $sector.max.y) {
            this.future.y(i, $sector.min.y)
          } else if (y < $sector.min.y) {
            this.future.y(i, $sector.max.y)
          }

          if (z > $sector.max.z) {
            this.future.z(i, $sector.min.z)
          } else if (z < $sector.min.z) {
            this.future.z(i, $sector.max.z)
          }
        }

        // warp out of bounds to other side
      }
    }
  }
}

new Physics()
