import { EShape, ESpell } from 'src/fate/weave'
import { ICardinal } from 'src/system/enum'
import { ERipple, Spell } from '../spell'

export default {
  [ESpell.FLOCK](i: number, $c: ICardinal, $spell: Spell) {
    $spell.flock.shape = $c.fate.data0(i)
    $spell.flock.size = $c.fate.data1(i)
    $spell.flock.step = $c.fate.data2(i)

    $spell.Ripple(ERipple.FLOCK, $spell.flock)
  },
  [ESpell.FLOCK_LINE](i: number, $c: ICardinal, $spell: Spell) {
    $spell.flock.shape = EShape.LINE
    $spell.flock.size = $c.fate.data0(i)
    $spell.flock.step = $c.fate.data1(i)
    $spell.flock.size2 = $c.fate.data2(i)

    $spell.Ripple(ERipple.FLOCK, $spell.flock)
  },
  [ESpell.FLOCK_GRID](i: number, $c: ICardinal, $spell: Spell) {
    $spell.flock.shape = EShape.PLANE
    $spell.flock.size = $c.fate.data0(i)
    $spell.flock.step = $c.fate.data1(i)
    $spell.flock.size2 = $c.fate.data2(i)
    $spell.Ripple(ERipple.FLOCK, $spell.flock)
  },
  [ESpell.FLOCK_RING](i: number, $c: ICardinal, $spell: Spell) {
    $spell.flock.shape = EShape.RING
    $spell.flock.size = $c.fate.data0(i)
    $spell.flock.step = $c.fate.data1(i)
    $spell.Ripple(ERipple.FLOCK, $spell.flock)
  },
  [ESpell.FLOCK_RECT](i: number, $c: ICardinal, $spell: Spell) {
    $spell.flock.shape = EShape.RECT
    $spell.flock.size = $c.fate.data0(i)
    $spell.flock.size2 = $c.fate.data1(i)
    $spell.flock.step = $c.fate.data2(i)
    $spell.Ripple(ERipple.FLOCK, $spell.flock)
  },
  [ESpell.FLOCK_TEXT](i: number, $c: ICardinal, $spell: Spell) {
    $spell.text = $c.fate.text(i)
    $spell.Ripple(ERipple.TEXT, $spell.text)
  },
}
