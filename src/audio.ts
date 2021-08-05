import { url } from 'src/input/browser'
import { Uniform } from 'three'
import { tick } from './time'
import { Value } from './valuechannel'

export const audio = document.getElementById('bgm') as HTMLAudioElement

export const context = new Value<AudioContext>(undefined)
let started = false

audio.onplay = function () {
  if (started) return
  started = true
  context.is(new AudioContext())
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

    lowerAvg.is(sum(lowerHalfArray) / lowerHalfArray.length)
    upperAvg.is(sum(upperHalfArray) / upperHalfArray.length)
  })
}

export const upperUniform = new Uniform(0)
export const lowerUniform = new Uniform(0)

export const upperAvg = new Value(0)
upperAvg.on(($ua) => (upperUniform.value = $ua))

export const lowerAvg = new Value(0)
lowerAvg.on(($la) => (lowerUniform.value = $la))

// change audio source based on URL
url.on(($url) => {
  switch ($url[0]) {
    case 'music':
      audio.src = `/music/${$url[1]}.mp3`
      audio.load()
  }
})
