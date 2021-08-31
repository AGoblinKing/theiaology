import { fantasy } from 'src/land/land'
let past = []
let future = []

let isUndo = false
let cancel

fantasy.on(($r) => {
  if (cancel) cancel()

  past = []
  future = []

  cancel = $r.timeline.on(($t) => {
    past.push($t.toArray())
    if (past.length > 5) {
      past.shift()
    }
  })
})

export function Undo() {
  const { timeline } = fantasy.$
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
  const { timeline } = fantasy.$
  const p = future.pop()

  if (!p) return

  timeline.$.fromArray(p)
  timeline.poke()
}
