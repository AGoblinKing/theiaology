import { ESpell } from 'src/fate/weave'
import { ICardinal } from 'src/system/enum'
import { ERipple, Spell } from '../spell'

export default {
  [ESpell.SHAPE_VAR](i: number, $c: ICardinal, $spell: Spell) {
    $spell.sizevar.set($c.fate.data0(i), $c.fate.data1(i), $c.fate.data2(i))
    $spell.Ripple(ERipple.SIZEVAR, $spell.sizevar)
  },
  [ESpell.SHAPE_COLOR](i: number, $c: ICardinal, $spell: Spell) {
    const rgb = $c.fate.data0(i)
    $spell.color.setHex(rgb)
    $spell.col.tilt = $c.fate.data1(i)
    $spell.col.variance = $c.fate.data2(i)
    $spell.Ripple(ERipple.COL, $spell.col)
    $spell.Ripple(ERipple.COLOR, $spell.color)
  },
  [ESpell.SHAPE](i: number, $c: ICardinal, $spell: Spell) {
    $spell.size.x = $c.fate.data0(i)
    $spell.size.y = $c.fate.data1(i)
    $spell.size.z = $c.fate.data2(i)
    $spell.Ripple(ERipple.SIZE, $spell.size)
  },
  [ESpell.SHAPE_EFFECTS](i: number, $c: ICardinal, $spell: Spell) {
    $spell.effect = $c.fate.data0(i)
    $spell.Ripple(ERipple.EFFECT, $spell.effect)

    for (const atom of $spell.live()) {
      $c.animation.animation(atom, $spell.effect)
    }
  },
}
