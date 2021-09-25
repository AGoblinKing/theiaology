import { ESpell } from 'src/fate/weave'
import { ICardinal } from 'src/system/enum'
import { Spell } from '../spell'

export default {
  [ESpell.AI](i: number, $c: ICardinal, $spell: Spell) {
    $spell.role = $c.fate.data0(i)

    for (let a of $spell.all()) {
      $c.traits.role(a, $spell.role)
    }
  },
}
