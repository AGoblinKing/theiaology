import { ESpell } from 'src/fate/weave'
import { EMessage, ICardinal } from 'src/system/enum'
import { Vector3 } from 'three'
import { ERipple, Spell } from '../spell'

const $vec = new Vector3()
const $vec2 = new Vector3()
const $siz = new Vector3()

export default {
  [ESpell.DO_REZ](i: number, $c: ICardinal, $spell: Spell) {
    return i
  },
  [ESpell.DO_FREE](i: number, $c: ICardinal, $spell: Spell) {
    for (let atom of $spell.atoms) {
      $c.free(atom)
    }
    $spell.atoms = []

    $spell.Ripple(ERipple.FREE)

    if ($spell.lands > 0) {
      $c.post({
        message: EMessage.LAND_REMOVE,
        id: $spell.id,
      })

      $spell.lands = 0
    }
  },

  [ESpell.DO_SEEK](i: number, $c: ICardinal, $spell: Spell) {
    const t = $c.fate.data0(i)

    $c.lastTime = t
    $c.clutchFate = true
    $c.universal.musicTime(t)
    $c.post({
      message: EMessage.CARD_SEEK,
      time: t,
    })
  },

  [ESpell.DO_SELECT](i: number, $c: ICardinal, $spell: Spell) {
    $siz.copy($spell.size).multiplyScalar(0.5)
    // tell the phys system to remove
    $c.post({
      message: EMessage.PHYS_SELECT,
      min: $vec.copy($spell.pos).sub($siz),
      max: $vec2.copy($spell.pos).add($siz),
      is: $c.fate.short(i, 1),
      not: $c.fate.short(i, 2),
      do: $c.fate.data0(i),
    })
  },
}
