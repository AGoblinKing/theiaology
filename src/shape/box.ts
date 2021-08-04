import { SIZE } from 'src/rez'
import { Matrix4 } from 'three'

export interface IBoxShape {
  where: Matrix4
  size: number
  size2: number
  halfsize: number
}

// like a turtle going outwards
export function BoxShape(atom: Matrix4, i: number, opts: IBoxShape): Matrix4 {
  // how large is the box?
  const z = Math.floor(i / opts.size2)

  return atom
    .identity()
    .makeTranslation(
      (i % opts.size) * SIZE - opts.halfsize,
      Math.floor((i - z * opts.size2) / opts.size) * SIZE - opts.halfsize,
      z * SIZE - opts.halfsize
    )
    .multiply(opts.where)
}
