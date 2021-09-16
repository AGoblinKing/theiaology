import { ESpell } from 'src/fate/weave'
import { ICardinal } from 'src/system/enum'
import { ERipple, Spell } from '../spell'

export default {
  [ESpell.VOX](i: number, $c: ICardinal, $spell: Spell) {
    $spell.vox = $c.fate.text(i)
    $spell.ripple(ERipple.VOX, $spell.vox)
  },

  [ESpell.VOX_VAR](i: number, $c: ICardinal, $spell: Spell) {
    $spell.voxvar.set($c.fate.data0(i), $c.fate.data1(i), $c.fate.data2(i))

    $spell.ripple(ERipple.VOXVAR, $spell.voxvar)
  },
}
