import { ESpell } from 'src/fate/weave'
import { ICardinal } from 'src/system/enum'
import { Vector3 } from 'three'
import { ERipple, Spell } from '../spell'

const $vec3 = new Vector3()

export default {
  [ESpell.POS](i: number, $c: ICardinal, $spell: Spell, sec?: number) {
    $spell.pos.x = $c.fate.data0(i)
    $spell.pos.y = $c.fate.data1(i)
    $spell.pos.z = $c.fate.data2(i)

    for (let atom of $spell.live()) {
      $c.future.x(atom, $spell.pos.x)
      $c.future.y(atom, $spell.pos.y)
      $c.future.z(atom, $spell.pos.z)
      $c.future.time(atom, sec)
    }

    $spell.Ripple(ERipple.POS, $spell.pos)
  },
  [ESpell.POS_ADD](i: number, $c: ICardinal, $spell: Spell, sec?: number) {
    $spell.pos.add(
      $vec3.set($c.fate.data0(i), $c.fate.data1(i), $c.fate.data2(i))
    )

    $spell.Ripple(ERipple.POSADD, $vec3)

    for (let atom of $spell.live()) {
      $c.future.addX(atom, $vec3.x)
      $c.future.addY(atom, $vec3.y)
      $c.future.addZ(atom, $vec3.z)
      $c.future.time(sec)
    }
  },
  [ESpell.POS_VAR](i: number, $c: ICardinal, $spell: Spell) {
    $spell.posvar.x = $c.fate.data0(i)
    $spell.posvar.y = $c.fate.data1(i)
    $spell.posvar.z = $c.fate.data2(i)
    $spell.Ripple(ERipple.POSVAR, $spell.posvar)
  },
}
