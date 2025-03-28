import Synth from '@/classes/Synth.ts'

export default class Keyboard {
  static synth: Synth

  static NOTE_BINDINGS: { [key: string]: [string, number] } = {
    // Bottom Row
    Z: ['C', 4],
    S: ['Db', 4],
    X: ['D', 4],
    D: ['Eb', 4],
    C: ['E', 4],
    V: ['F', 4],
    G: ['Gb', 4],
    B: ['G', 4],
    H: ['Ab', 4],
    N: ['A', 4],
    J: ['Bb', 4],
    M: ['B', 4],
    ',': ['C', 5],
    L: ['Db', 5],
    '.': ['D', 5],
    ';': ['Eb', 5],
    '/': ['E', 5],

    // Top Row
    Q: ['C', 5],
    2: ['Db', 5],
    W: ['D', 5],
    3: ['Eb', 5],
    E: ['E', 5],
    R: ['F', 5],
    5: ['Gb', 5],
    T: ['G', 5],
    6: ['Ab', 5],
    Y: ['A', 5],
    7: ['Bb', 5],
    U: ['B', 5],
    I: ['C', 6],
    9: ['Db', 6],
    O: ['D', 6],
    0: ['Eb', 6],
    P: ['E', 6],
    '[': ['F', 6],
  }

  static keyToNote(key: string) {
    return Keyboard.NOTE_BINDINGS[key]
  }

  static initialize() {
    Keyboard.synth = new Synth({ name: 'Keyboard' })

    document.addEventListener('keydown', (e) => {
      this.keyDown(e)
    })

    document.addEventListener('keyup', (e) => {
      this.keyUp(e)
    })
  }

  static keyDown(e: KeyboardEvent) {
    if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return

    const key = Keyboard.keyToNote(e.key.toUpperCase())
    if (e.repeat || key == undefined) return

    Keyboard.synth.playNote(key[0], key[1])
    e.preventDefault()
  }

  static keyUp(e: KeyboardEvent) {
    if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return

    const key = Keyboard.keyToNote(e.key.toUpperCase())
    if (e.repeat || key == undefined) return

    Keyboard.synth.stopNote(key[0], key[1])
    e.preventDefault()
  }
}
