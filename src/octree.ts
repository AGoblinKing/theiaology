// based on https://github.com/pmndrs/cannon-es/blob/master/src/utils/Octree.ts

import { Box3, Vector3 } from 'three'

const MAX_DEPTH = 4

const ALPHA = new Vector3(-1, -1, -1),
  BETA = new Vector3(-1, -1, 1),
  GAMMA = new Vector3(-1, 1, 1),
  DELTA = new Vector3(1, 1, 1),
  EPSILON = new Vector3(1, -1, 1),
  ZETA = new Vector3(1, -1, -1),
  ETA = new Vector3(1, 1, -1),
  THETA = new Vector3(-1, 1, -1)

const $size = new Vector3(1, 1, 1)
const $vec3 = new Vector3()

export class Octree {
  data: Set<number>
  children: Octree[] = []
  box: Box3

  constructor(box: Box3) {
    this.box = box
    this.data = new Set()
  }

  sample(box: Box3): Set<number> {
    const results = []

    const queue: Octree[] = [this]
    while (queue.length) {
      const node = queue.pop()
      if (node.box.intersectsBox(box)) {
        results.push(...node.data)
      }
      queue.push(...node.children)
    }

    return new Set(results)
  }

  subdivide() {
    this.box.getSize($size).multiplyScalar(0.5)
    const halfBox = this.box.clone().expandByScalar(0.5)

    this.children.push(
      new Octree(halfBox.clone().translate($vec3.copy(ALPHA).multiply($size))),
      new Octree(halfBox.clone().translate($vec3.copy(BETA).multiply($size))),
      new Octree(halfBox.clone().translate($vec3.copy(GAMMA).multiply($size))),
      new Octree(halfBox.clone().translate($vec3.copy(DELTA).multiply($size))),
      new Octree(
        halfBox.clone().translate($vec3.copy(EPSILON).multiply($size))
      ),
      new Octree(halfBox.clone().translate($vec3.copy(ZETA).multiply($size))),
      new Octree(halfBox.clone().translate($vec3.copy(ETA).multiply($size))),
      new Octree(halfBox.translate($vec3.copy(THETA).multiply($size)))
    )
  }

  insert(box: Box3, id: number, level = 0): boolean {
    if (!this.box.containsBox(box)) {
      return false
    }

    if (level < MAX_DEPTH) {
      if (this.children.length === 0) this.subdivide()

      for (let child of this.children) {
        if (child.insert(box, id, level + 1)) {
          return true
        }
      }
    }

    this.data.add(id)

    return true
  }

  reset() {
    this.data.clear()
    for (let child of this.children) {
      child.reset()
    }
  }
}
