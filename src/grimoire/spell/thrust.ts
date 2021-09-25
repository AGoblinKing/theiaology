import { EAxis, ESpell } from 'src/fate/weave'
import { ICardinal } from 'src/system/enum'
import { Vector3 } from 'three'
import { ERipple, Spell } from '../spell'

const $vec3 = new Vector3()

export default {
  [ESpell.THRUST](i: number, $c: ICardinal, $spell: Spell) {
    $spell.vel.set($c.fate.data0(i), $c.fate.data1(i), $c.fate.data2(i))

    for (let atom of $spell.all()) {
      $c.thrust.x(atom, $spell.vel.x)
      $c.thrust.y(atom, $spell.vel.y)
      $c.thrust.z(atom, $spell.vel.z)

      $c.velocity.x(atom, $spell.vel.x)
      $c.velocity.y(atom, $spell.vel.y)
      $c.velocity.z(atom, $spell.vel.z)
    }

    $spell.ripple(ERipple.VEL, $spell.vel)
  },
  [ESpell.THRUST_ADD](i: number, $c: ICardinal, $spell: Spell) {
    $spell.vel.add(
      $vec3.set($c.fate.data0(i), $c.fate.data1(i), $c.fate.data2(i))
    )

    $spell.ripple(ERipple.VELADD, $vec3)

    for (let atom of $spell.all()) {
      $c.thrust.addX(atom, $vec3.x)
      $c.thrust.addY(atom, $vec3.y)
      $c.thrust.addZ(atom, $vec3.z)

      $c.velocity.addX(atom, $vec3.x)
      $c.velocity.addY(atom, $vec3.y)
      $c.velocity.addZ(atom, $vec3.z)
    }
  },
  [ESpell.THRUST_VAR](i: number, $c: ICardinal, $spell: Spell) {
    const amount = $c.fate.data1(i)
    const constraint = $c.fate.data2(i)

    switch ($c.fate.data0(i)) {
      case EAxis.XYZ:
        $spell.velvar.z += amount
        $spell.velvarconstraint.z = constraint
      // fallthrough
      case EAxis.XY:
        $spell.velvar.y += amount
        $spell.velvar.x += amount
        $spell.velvarconstraint.y = constraint
        $spell.velvarconstraint.x = constraint
        break
      case EAxis.XZ:
        $spell.velvar.z += amount
        $spell.velvar.x += amount
        $spell.velvarconstraint.z = constraint
        $spell.velvarconstraint.x = constraint
        break
      case EAxis.YZ:
        $spell.velvar.y += amount
        $spell.velvar.z += amount
        $spell.velvarconstraint.y = constraint
        $spell.velvarconstraint.z = constraint
        break
      case EAxis.X:
        $spell.velvar.x += amount
        $spell.velvarconstraint.x = constraint
        break
      case EAxis.Y:
        $spell.velvar.y += amount
        $spell.velvarconstraint.y = constraint
        break
      case EAxis.Z:
        $spell.velvar.z += amount
        $spell.velvarconstraint.z = constraint
        break
    }

    for (let atom of $spell.all()) {
      $c.thrust.x(
        atom,
        $spell.vel.x +
          $spell.velvar.x * Math.random() -
          $spell.velvar.x / 2 +
          ($spell.velvarconstraint.x * $spell.velvar.x) / 2
      )
      $c.thrust.y(
        atom,
        $spell.vel.y +
          $spell.velvar.y * Math.random() -
          $spell.velvar.y / 2 +
          ($spell.velvarconstraint.y * $spell.velvar.y) / 2
      )
      $c.thrust.z(
        atom,
        $spell.vel.z +
          $spell.velvar.z * Math.random() -
          $spell.velvar.z / 2 +
          ($spell.velvarconstraint.z * $spell.velvar.z) / 2
      )

      $c.velocity.x(atom, $c.thrust.x(atom))
      $c.velocity.y(atom, $c.thrust.y(atom))
      $c.velocity.z(atom, $c.thrust.z(atom))
    }

    $spell.ripple(ERipple.VELVAR, $spell.velvar)
    $spell.ripple(ERipple.VELVARCONSTRAINT, $spell.velvarconstraint)
  },
}
