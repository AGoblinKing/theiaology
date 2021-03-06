import { ESpell } from 'src/fate/weave'
import { EMessage, ICardinal } from 'src/system/enum'
import { Spell } from '../spell'

export default {
  [ESpell.FAE_AVATAR](i: number, $c: ICardinal, $spell: Spell) {
    $spell.avatar = true
    $spell.avatarThrust = $c.fate.data0(i)

    if ($spell.atoms.length === 0) return

    const id = $spell.atoms[0]
    $c.universal.avatar(id)
    $c.universal.thrustStrength($spell.avatarThrust)
    $c.post(EMessage.CARD_AVATAR)
  },
  [ESpell.FAE_POS](i: number, $c: ICardinal, $spell: Spell) {
    $c.universal.faeX($c.fate.data0(i))
    $c.universal.faeY($c.fate.data1(i))
    $c.universal.faeZ($c.fate.data2(i))
    $c.post(EMessage.FAE_POS_UPDATE)
  },
  [ESpell.FAE_ROT](i: number, $c: ICardinal, $spell: Spell) {
    $c.universal.faeRX($c.fate.data0(i))
    $c.universal.faeRY($c.fate.data1(i))
    $c.universal.faeRZ($c.fate.data2(i))
    $c.post(EMessage.FAE_ROT_UPDATE)
  },
  [ESpell.UNI_GRAVITY](i: number, $c: ICardinal, $spell: Spell) {
    $c.universal.gravityX($c.fate.data0(i))
    $c.universal.gravityY($c.fate.data1(i))
    $c.universal.gravityZ($c.fate.data2(i))
  },
  [ESpell.FAE_COLOR](i: number, $c: ICardinal, $spell: Spell) {
    $c.universal.faeHue($c.fate.data0(i))
    $c.universal.faeHueVariance($c.fate.data1(i))
  },
}
