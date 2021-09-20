import { ESpell } from 'src/fate/weave'
import { EMessage, ICardinal } from 'src/system/enum'
import { Spell } from '../spell'

export default {
  [ESpell.DO_MIDI](i: number, $c: ICardinal, $spell: Spell) {
    // calc if avatar can hear it/add spatial

    // needs to delay
    setTimeout(() => {
      const note = $c.fate.data0(i)

      $c.post({
        message: EMessage.CARDINAL_MIDI,
        data: [$spell.midi.instrument, note, $spell.midi.volume * 100],
      })
    })
  },
  [ESpell.DO_REZ](i: number, $c: ICardinal, $spell: Spell) {
    return i
  },
  [ESpell.DO_FREE](i: number, $c: ICardinal, $spell: Spell) {
    for (let atom of $spell.atoms) {
      $c.free(atom)
    }
    $spell.atoms = []

    if ($spell.lands > 0) {
      $c.post({
        message: EMessage.LAND_REMOVE,
        id: $spell.id,
      })

      $spell.lands = 0
    }
  },
}
