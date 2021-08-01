import { animation, EAnimation } from 'src/buffer/animation'
import { meshes, Rez } from 'src/rez'
import { Color, Matrix4, Vector3 } from 'three'

class Fire {
  where: Vector3
  spread: number
  count: number
  color: Color
  constructor(
    where: Vector3,
    spread: number = 5,
    count: 10,
    color: Color = new Color(0xff0000)
  ) {
    this.where = where
    this.spread = spread
    this.count = count
    this.color = color
  }
  rez() {
    Rez(FireRez, this.count, this)
  }
}

// set the color and effects of a fire
export function FireRez(atom: Matrix4, i: number, fire: Fire, ix: number) {
  animation.set(ix, EAnimation.Fire)

  meshes.$.setColorAt(ix, fire.color)
  return atom.identity().setPosition(fire.where.x, fire.where.y, fire.where.z)
}
