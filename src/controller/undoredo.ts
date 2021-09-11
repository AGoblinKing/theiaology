import { fantasy } from 'src/realm/realm'
let past = []
let future = []

let isUndo = false
let cancel

fantasy.subscribe(($r) => {
  if (cancel) cancel()

  past = []
  future = []

  cancel = $r.fate.subscribe(($t) => {
    past.push($t.toArray())
    if (past.length > 5) {
      past.shift()
    }
  })
})

export function Undo() {
  const { fate: timeline } = fantasy.$
  let p = past.pop()

  if (!p) return
  p = past.pop()
  if (!p) return
  isUndo = true
  future.push(timeline.$.toArray())
  timeline.$.fromArray(p)
  timeline.poke()
  isUndo = false
}

export function Redo() {
  const { fate: timeline } = fantasy.$
  const p = future.pop()

  if (!p) return

  timeline.$.fromArray(p)
  timeline.poke()
}
