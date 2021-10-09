import { ESpell } from 'src/fate/weave'
import { ICardinal } from 'src/system/enum'
import { Spell } from '../spell'

export default {
  // TOME is special and in another place~
  // have a tome_options
  [ESpell.TOME_OPTIONS](i: number, $c: ICardinal, $spell: Spell) {
    // ripple does not ripple
    $spell.doRipple = $c.fate.data0(i) === 0
    $spell.doLive = $c.fate.data1(i) === 0
  },
}
