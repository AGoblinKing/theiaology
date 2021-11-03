import { ESpell } from 'src/fate/weave'
import { ICardinal } from 'src/system/enum'
import { ERipple, Spell } from '../spell'

export default {
  [ESpell.THEIA_REALM](i: number, $c: ICardinal, $spell: Spell) {
    $spell.land = $c.fate.text(i)
    $spell.Ripple(ERipple.LAND, $spell.land)
  },
  [ESpell.REACT_GATE](i: number, $c: ICardinal, $spell: Spell) {
    // send the load command
    $spell.gate = $c.fate.text(i)
    // no ripple
  },
  [ESpell.THEIA_RULER](i: number, $c: ICardinal, $spell: Spell) {
    $spell.ruler = $c.fate.text(i)
    $spell.Ripple(ERipple.RULER, $spell.ruler)
  },
}
