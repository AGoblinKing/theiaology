import { ESpell } from 'src/fate/weave'
import { EMessage, ICardinal } from 'src/system/enum'
import { Spell } from '../spell'

export default {
  [ESpell.UNI_IDLE](i: number, $c: ICardinal, $spell: Spell) {
    $c.universal.idle($c.fate.data0(i))
  },
  [ESpell.UNI_CLEAR_COLOR](i: number, $c: ICardinal, $spell: Spell) {
    $c.universal.clearColor($c.fate.data0(i))
    $c.post(EMessage.CLEAR_COLOR_UPDATE)
  },
}
