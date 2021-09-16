import { ESpell } from 'src/fate/weave'
import { EMessage, ICardinal } from 'src/system/enum'
import { Spell } from '../spell'

export default {
  [ESpell.USER_AVATAR](i: number, $c: ICardinal, $spell: Spell) {
    $spell.avatar = true
    $spell.avatarThrust = $c.fate.data0(i)

    if ($spell.atoms.length === 0) return

    const id = $spell.atoms[0]
    $c.universal.avatar(id)
    $c.universal.thrustStrength($spell.avatarThrust)
    $c.post(EMessage.CARDINAL_AVATAR)
  },
  [ESpell.USER_POS](i: number, $c: ICardinal, $spell: Spell) {
    $c.universal.userX($c.fate.data0(i))
    $c.universal.userY($c.fate.data1(i))
    $c.universal.userZ($c.fate.data2(i))
    $c.post(EMessage.USER_POS_UPDATE)
  },
  [ESpell.USER_ROT](i: number, $c: ICardinal, $spell: Spell) {
    $c.universal.userRX($c.fate.data0(i))
    $c.universal.userRY($c.fate.data1(i))
    $c.universal.userRZ($c.fate.data2(i))
    $c.post(EMessage.USER_ROT_UPDATE)
  },
}
