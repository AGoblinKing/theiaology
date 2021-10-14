import { EAxis, ESpell } from 'src/fate/weave'
import { ICardinal } from 'src/system/enum'
import { ERipple, Spell } from '../spell'

export default {
  [ESpell.PHYS_PHASE](i: number, $c: ICardinal, $spell: Spell) {
    $spell.phase = $c.fate.data0(i)
    $spell.tag1 = $c.fate.short(i, 1)
    $spell.tag2 = $c.fate.short(i, 2)

    $spell.Ripple(ERipple.PHASE, $spell)

    for (let atom of $spell.live()) {
      $c.phys.phase(atom, $spell.phase)
      $c.phys.tag(atom, $spell.tag1)
      $c.phys.tag2(atom, $spell.tag2)
    }
  },
  [ESpell.PHYS_CAGE](i: number, $c: ICardinal, $spell: Spell) {
    const min = $c.fate.data1(i)
    const max = $c.fate.data2(i)
    switch ($c.fate.data0(i)) {
      case EAxis.XYZ:
        $spell.cage.min.z = min
        $spell.cage.max.z = max
      // fallthrough
      case EAxis.XY:
        $spell.cage.min.y = min
        $spell.cage.max.y = max
        $spell.cage.min.x = min
        $spell.cage.max.x = max
        break
      case EAxis.XZ:
        $spell.cage.min.x = min
        $spell.cage.max.x = max
        $spell.cage.min.z = min
        $spell.cage.max.z = max
        break
      case EAxis.YZ:
        $spell.cage.min.y = min
        $spell.cage.max.y = max
        $spell.cage.min.z = min
        $spell.cage.max.z = max
        break
      case EAxis.X:
        $spell.cage.min.x = min
        $spell.cage.max.x = max
        break
      case EAxis.Y:
        $spell.cage.min.y = min
        $spell.cage.max.y = max
        break
      case EAxis.Z:
        $spell.cage.min.z = min
        $spell.cage.max.z = max
        break
    }

    $spell.Ripple(ERipple.CAGE, $spell.cage)

    for (let atom of $spell.live()) {
      switch ($c.fate.data0(i)) {
        case EAxis.XYZ:
          $c.cage.z(atom, min)
          $c.cage.mZ(atom, max)
        // fallthrough
        case EAxis.XY:
          $c.cage.y(atom, min)
          $c.cage.mY(atom, max)
          $c.cage.x(atom, min)
          $c.cage.mX(atom, max)
          break
        case EAxis.XZ:
          $c.cage.x(atom, min)
          $c.cage.mX(atom, max)
          $c.cage.z(atom, min)
          $c.cage.mZ(atom, max)
          break
        case EAxis.YZ:
          $c.cage.y(atom, min)
          $c.cage.mY(atom, max)
          $c.cage.z(atom, min)
          $c.cage.mZ(atom, max)
          break
        case EAxis.X:
          $c.cage.x(atom, min)
          $c.cage.mX(atom, max)
          break
        case EAxis.Y:
          $c.cage.y(atom, min)
          $c.cage.mY(atom, max)
          break
        case EAxis.Z:
          $c.cage.z(atom, min)
          $c.cage.mZ(atom, max)
          break
      }
    }
  },
}
