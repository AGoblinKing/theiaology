import { ESpell } from 'src/fate/weave'
import { ICardinal } from 'src/system/enum'
import { ERipple, Spell } from '../spell'

export default {
  [ESpell.THEIA_REALM](i: number, $c: ICardinal, $spell: Spell) {
    $spell.land = $c.fate.text(i)
    $spell.ripple(ERipple.LAND, $spell.land)
  },
  [ESpell.THEIA_GATE](i: number, $c: ICardinal, $spell: Spell) {
    $spell.gate = $c.fate.text(i)
  },
  [ESpell.THEIA_RULER](i: number, $c: ICardinal, $spell: Spell) {
    $spell.ruler = $c.fate.text(i)
    $spell.ripple(ERipple.RULER, $spell.ruler)
  },
}
