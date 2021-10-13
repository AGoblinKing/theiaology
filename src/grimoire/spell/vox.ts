import { NORMALIZER } from 'src/config'
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

  [ESpell.VOX_BREAK](i: number, $c: ICardinal, $spell: Spell) {
    const targets = $spell.live()

    $spell.voxbroken = true

    let count = Math.floor(targets.length / $c.fate.data0(i) / NORMALIZER)
    for (let atom of targets) {
      if (count <= 0) break
      if (atom === $c.phys.core(atom)) continue

      $c.phys.core(atom, 0)
      count--
    }
  },
}
