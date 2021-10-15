import { NORMALIZER } from 'src/config'
import { ESpell } from 'src/fate/weave'
import { EMessage, ICardinal } from 'src/system/enum'
import { Spell } from '../spell'

export default {
  [ESpell.MIDI](i: number, $c: ICardinal, $spell: Spell) {
    // calc if avatar can hear it/add spatial

    // needs to delay
    setTimeout(() => {
      const note = $c.fate.data0(i)

      $c.post({
        message: EMessage.CARD_MIDI,
        data: [$spell.midi.instrument, note, $spell.midi.volume * 100],
      })
    })
  },
  [ESpell.MIDI_CHIRP](i: number, $c: ICardinal, $spell: Spell) {
    // needs to delay
    setTimeout(() => {
      const ins = $c.fate.data0(i),
        note = $c.fate.data1(i),
        vol = $c.fate.data2(i) / NORMALIZER

      $c.post({
        message: EMessage.CARD_MIDI_CHIRP,
        data: [ins, note, vol * 100],
      })
    })
  },
  [ESpell.MIDI_INSTRUMENT](i: number, $c: ICardinal, $spell: Spell) {
    const instrument = $c.fate.data0(i),
      volume = $c.fate.data1(i) / NORMALIZER,
      pan = $c.fate.data2(i) / NORMALIZER

    $spell.midi.instrument = instrument
    $spell.midi.volume = volume
    $spell.midi.pan = pan
  },
  [ESpell.NOISE_PASSIVE](i: number, $c: ICardinal, $spell: Spell) {
    $spell.noise = $c.fate.data0(i)

    for (const atom of $spell.live()) {
      $c.noise.passive(atom, $spell.noise)
    }
  },
}
