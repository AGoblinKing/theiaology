import { get, set } from 'idb-keyval'
import { Uniform } from 'three'
import WebAudioTinySynth from 'webaudio-tinysynth'
import { tick } from '../shader/time'
import { Value } from '../value'
import { EMidiInstrument } from './midi'

let lastVolume = 1

export const audio = document.getElementById('bgm') as HTMLAudioElement
export const audio_buffer = new Value<ArrayBufferLike | DataView>()
export const audio_name = new Value('')
export const volume = new Value(1)
  .do(async () => {
    get('$audio_volume').then((v) => {
      volume.set(v)
    })
  })
  .re((v) => {
    if (v === undefined) return

    set('$audio_volume', v)

    lastVolume = v
    audio.volume = v
  })

export const mute = new Value(false)
  .do(async () => {
    get('$audio_mute').then((v) => {
      mute.set(v)
    })
  })
  .re((v) => {
    if (v === undefined) return

    set('$audio_mute', v)

    audio.muted = v
  })

export const context = new Value<AudioContext>()
let started = false

export const synth = new Value<WebAudioTinySynth>(undefined)

export const makeAudioReady = async () => {
  if (synth.$ !== undefined) return

  const s = new WebAudioTinySynth({
    quality: 0,
    voices: 1024,
    useReverb: 1,
  })
  await s.ready()
  synth.set(s)
}

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
  if (lastVolume !== audio.volume) {
    lastVolume = audio.volume
    volume.set(lastVolume)
  }
  if (audio.muted !== mute.$) {
    mute.set(audio.muted)
  }

  if (seconds.$ !== audio.currentTime) {
    seconds.set(audio.currentTime)
  }
})

const $midi = [0x90, 0, 0]
let attempt = false
export const MIDI = (
  instrument: EMidiInstrument,
  note: number,
  velocity: number
) => {
  if (audio.muted) return false

  if (synth.$ === undefined) {
    return false
  }
  // ensure channel has that instrument set
  synth.$.setProgram(0, instrument)

  $midi[1] = note
  $midi[2] = Math.round(velocity * 100 * audio.volume)

  synth.$.send($midi)

  $midi[2] = 0
  synth.$.send($midi)

  return false
}

Object.assign(window, { MIDI })

export function Tune(timer: number, count: number, skip: (i) => void) {
  let i = 0
  const intv = setInterval(() => {
    if (i >= count) {
      clearInterval(intv)
      return
    }
    skip(i++)
  }, timer)
}

export function Chirp(ins = 81, note = 90, volume = 0.5) {
  Tune(25, 15, (i) => {
    if (i % 3 === 0) return
    MIDI(ins, note + (i % 5), volume)
  })
}

const view = new DataView(new ArrayBuffer(4))

export function Play(noise: number) {
  view.setInt32(0, noise)

  let i = 0
  const intv = setInterval(() => {
    if (i >= 8) {
      return clearInterval(intv)
    }
    if (view.getUint8(3) & (1 << i)) {
      MIDI(view.getUint8(0), view.getUint8(1), view.getUint8(2) / 256)
    }
    i++
  }, (1 / 8) * 1000)
}
