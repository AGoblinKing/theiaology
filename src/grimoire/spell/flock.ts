import { EShape, ESpell } from 'src/fate/weave'
import { ICardinal } from 'src/system/enum'
import { ERipple, Spell } from '../spell'

export default {
  [ESpell.FLOCK](i: number, $c: ICardinal, $spell: Spell) {
    $spell.flock.shape = $c.fate.data0(i)
    $spell.flock.size = $c.fate.data1(i)
    $spell.flock.step = $c.fate.data2(i)
    $spell.ripple(ERipple.FLOCK, $spell.flock)
  },

  [ESpell.FLOCK_GRID](i: number, $c: ICardinal, $spell: Spell) {
    $spell.flock.shape = EShape.PLANE
    $spell.flock.size = $c.fate.data0(i)
    $spell.flock.step = $c.fate.data1(i)
    $spell.ripple(ERipple.FLOCK, $spell.flock)
  },
  [ESpell.FLOCK_RING](i: number, $c: ICardinal, $spell: Spell) {
    $spell.flock.shape = EShape.RING
    $spell.flock.size = $c.fate.data0(i)
    $spell.flock.step = $c.fate.data1(i)
    $spell.ripple(ERipple.FLOCK, $spell.flock)
  },
  [ESpell.FLOCK_RECT](i: number, $c: ICardinal, $spell: Spell) {
    $spell.flock.shape = EShape.RECT
    $spell.flock.size = $c.fate.data0(i)
    $spell.flock.size2 = $c.fate.data1(i)
    $spell.flock.step = $c.fate.data2(i)
    $spell.ripple(ERipple.FLOCK, $spell.flock)
  },
  [ESpell.FLOCK_TEXT](i: number, $c: ICardinal, $spell: Spell) {
    $spell.text = $c.fate.text(i)
    $spell.ripple(ERipple.TEXT, $spell.text)
  },
}
