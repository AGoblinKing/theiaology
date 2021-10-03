import { ESpell } from 'src/fate/weave'
import { EMessage, ICardinal } from 'src/system/enum'
import { Spell } from '../spell'

export default {
  [ESpell.GAME_SCORE](i: number, $c: ICardinal, $spell: Spell) {
    // do this unless trapped
    $c.universal.score($c.universal.score() + $c.fate.data0(i))
    setTimeout(() => $c.post(EMessage.UNI_SCORE))
  },
}
