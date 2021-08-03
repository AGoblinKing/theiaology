import { Color, Matrix4, Vector3 } from 'three'

export class Text {
  text = `hello abcde
  fghiji klmn o
  pqrstu vwxy z.!?`

  color = new Color(1, 1, 1)
  where = new Matrix4()
  cursor = new Vector3()

  count() {
    return this.text.length * 3
  }
}

// each character gets 3 cubes
export function TextRez(atom: Matrix4, i: number, t: Text, ix: number) {
  const char = t.text[Math.floor(i / 3)]
  const offset = i % 3
  if (i === 0) {
    t.cursor.set(0, 0, 0)
  }

  switch (char.toLowerCase()) {
    case ' ':
      // blank
      break
    case '\r':
      t.cursor.x = 0
      t.cursor.y += 1

      break
    case 'a':
      break
    case 'b':
      break
    case 'c':
      break
    case 'd':
      break
    case 'e':
      break
    case 'f':
      break
    case 'g':
      break

    case 'h':
      break
    case 'i':
      break
    case 'j':
      break
    case 'k':
      break

    case 'l':
      break
    case 'm':
      break

    case 'n':
      break
    case 'o':
      break

    case 'p':
      break
    case 'q':
      break
    case 'r':
      break
    case 's':
      break
    case 't':
      break
    case 'u':
      break
    case 'v':
      break
    case 'w':
      break
    case 'x':
      break
    case 'y':
      break
    case 'z':
      break
    case '!':
      break
    case '?':
      break
    case '.':
      break
  }
}
