import { Matrix4, Vector3 } from 'three'

const $vector3 = new Vector3()

class Transform extends Matrix4 {}

const $transform = new Transform()

export function LoadTransform(
  sharedTypedArray: Int32Array,
  i,
  transform = $transform
) {
  const ix = i * 16

  transform.set(
    // position
    Atomics.load(sharedTypedArray, ix + 0),
    Atomics.load(sharedTypedArray, ix + 1),
    Atomics.load(sharedTypedArray, ix + 2),

    // last position
    Atomics.load(sharedTypedArray, ix + 3),
    Atomics.load(sharedTypedArray, ix + 4),
    Atomics.load(sharedTypedArray, ix + 5),

    // animation 1
    Atomics.load(sharedTypedArray, ix + 6),
    Atomics.load(sharedTypedArray, ix + 7),
    Atomics.load(sharedTypedArray, ix + 8),

    // animation 2
    Atomics.load(sharedTypedArray, ix + 9),
    Atomics.load(sharedTypedArray, ix + 10),
    Atomics.load(sharedTypedArray, ix + 11),

    // color
    Atomics.load(sharedTypedArray, ix + 12),

    // scale
    Atomics.load(sharedTypedArray, ix + 13),

    // last scale
    Atomics.load(sharedTypedArray, ix + 14),

    // timestamp to complete lerps by
    Atomics.load(sharedTypedArray, ix + 15)
  )

  return transform
}

export function SetTransform(
  sharedTypedArray: Int32Array,
  i,
  transform = $transform
) {
  const ix = i * 16

  Atomics.exchange(sharedTypedArray, ix + 0, transform[0])
  Atomics.exchange(sharedTypedArray, ix + 1, transform[1])
  Atomics.exchange(sharedTypedArray, ix + 2, transform[2])
  Atomics.exchange(sharedTypedArray, ix + 3, transform[3])
  Atomics.exchange(sharedTypedArray, ix + 4, transform[4])
  Atomics.exchange(sharedTypedArray, ix + 5, transform[5])
  Atomics.exchange(sharedTypedArray, ix + 6, transform[6])
  Atomics.exchange(sharedTypedArray, ix + 7, transform[7])
  Atomics.exchange(sharedTypedArray, ix + 8, transform[8])
  Atomics.exchange(sharedTypedArray, ix + 9, transform[9])
  Atomics.exchange(sharedTypedArray, ix + 10, transform[10])
  Atomics.exchange(sharedTypedArray, ix + 11, transform[11])
  Atomics.exchange(sharedTypedArray, ix + 12, transform[12])
  Atomics.exchange(sharedTypedArray, ix + 13, transform[13])
  Atomics.exchange(sharedTypedArray, ix + 14, transform[14])
  Atomics.exchange(sharedTypedArray, ix + 15, transform[15])
}
