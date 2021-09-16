import { ESpell } from 'src/fate/weave'
import { ICardinal } from 'src/system/enum'
import { Spell } from '../spell'

export default {
  [ESpell.AI](i: number, $c: ICardinal, $spell: Spell) {
    $spell.role = $c.fate.data0(i)
  },
}
