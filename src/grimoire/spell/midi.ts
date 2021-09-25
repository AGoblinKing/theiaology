import { NORMALIZER } from 'src/config'
import { ESpell } from 'src/fate/weave'
import { ICardinal } from 'src/system/enum'
import { Spell } from '../spell'

export default {
  [ESpell.MIDI_INSTRUMENT](i: number, $c: ICardinal, $spell: Spell) {
    const instrument = $c.fate.data0(i),
      volume = $c.fate.data1(i) / NORMALIZER,
      pan = $c.fate.data2(i) / NORMALIZER

    $spell.midi.instrument = instrument
    $spell.midi.volume = volume
    $spell.midi.pan = pan
  },
}
