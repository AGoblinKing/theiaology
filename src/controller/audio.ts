import { Uniform } from 'three'
import WebAudioTinySynth from 'webaudio-tinysynth'
import { tick } from '../shader/time'
import { Value } from '../value'
import { EMidiChannel } from './midi'

export const audio = document.getElementById('bgm') as HTMLAudioElement
export const audio_buffer = new Value<ArrayBufferLike | DataView>()
export const audio_name = new Value('')

export const context = new Value<AudioContext>()
let started = false

export const synth = new Value<WebAudioTinySynth>(undefined)

window.addEventListener(
  'mousedown',
  () => {
    synth.set(new WebAudioTinySynth())
  },
  { once: true }
)

audio.onplay = function () {
  if (started) return
  started = true
  context.set(new AudioContext())
  const src = context.$.createMediaElementSource(audio)

  const analyser = context.$.createAnalyser()
  src.connect(analyser)

  analyser.connect(context.$.destination)

  analyser.fftSize = 512

  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)

  function sum(arr: Uint8Array) {
    let val = 0
    for (let i = 0; i < arr.length; i++) {
      val = val + arr[i]
    }

    return val
  }

  tick.on(() => {
    analyser.getByteFrequencyData(dataArray)
    const lowerHalfArray = dataArray.slice(0, dataArray.length / 2 - 1)
    const upperHalfArray = dataArray.slice(
      dataArray.length / 2 - 1,
      dataArray.length - 1
    )

    lowerAvg.set(sum(lowerHalfArray) / lowerHalfArray.length)
    upperAvg.set(sum(upperHalfArray) / upperHalfArray.length)
  })
}

audio.addEventListener('canplaythrough', () => {
  end.set(audio.duration)
})

export const seconds = new Value(0)
export const end = new Value(1)
export const upperUniform = new Uniform(0)
export const lowerUniform = new Uniform(0)

export const upperAvg = new Value(0)
upperAvg.on(($ua) => (upperUniform.value = $ua))

export const lowerAvg = new Value(0)
lowerAvg.on(($la) => (lowerUniform.value = $la))

tick.on(() => {
  if (seconds.$ !== audio.currentTime) {
    seconds.set(audio.currentTime)
  }
})

const $midi = [0, 0, 0]
export const midi = async (
  channel: EMidiChannel,
  note: number,
  velocity: number
) => {
  if (!synth.$) return

  midi[0] = channel
  midi[1] = note
  midi[2] = velocity

  await synth.$.ready

  synth.$.send($midi)
}
