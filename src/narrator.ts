// TTS Voice heh

import { Value } from './value'

export const voices = new Value<{ [key: string]: SpeechSynthesisVoice }>(
  {}
).log('voices')

window.addEventListener('ready', () => {
  speechSynthesis.getVoices().forEach((v) => {
    const name = v.lang.toLowerCase()
    if (name.indexOf('en') === -1) return

    voices.$[name] = v
  })

  voices.poke()
})

export function Narrate(text: string, voice) {}
