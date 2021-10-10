<script>
import { MIDI, Play } from 'src/controller/audio';

import { first } from 'src/realm';


import { Value } from 'src/value';
import { onDestroy } from 'svelte';

  import Box from '../Box.svelte'

  import { modal_default, modal_visible } from '../editor'

  let val = modal_default.$
  // organize-imports-ignore
  const buffer = new DataView(new ArrayBuffer(4))
  buffer.setInt32(0, val)

  $: instrument = buffer.getUint8(0)
  $: note = buffer.getUint8(1)
  $: velocity = buffer.getUint8(2)
  $: pattern = buffer.getUint8(3)

  $: pad = [...new Array(8)]
  $: pads = new Value([instrument, note, velocity, pattern])

  $: left = false

  function Click(i, ip) {
    return () => {
        pads.$[ip] ^= 1 << i
        for(let ix = 0; ix < 4; ix++) {
            buffer.setUint8(ix, pads.$[ix])
        }
        modal_visible.$(buffer.getInt32(0))
        Play(buffer.getInt32(0))
        pads.poke()
    }
  }

  onDestroy(() => {
    first.$.fate.poke()
  })


  Play(val)
</script>

<Box mute tilt={-159} style="padding: 0.4rem; display: grid; grid-template-rows: repeat(4, 1fr);">
{#each $pads as padder, ip}
    <pad>
    {#each pad as chance, i }
        <Box mute style="margin: 0.2rem;" tilt={padder & (1 << i) ? 120 : 60} over={() => {
            if(!left) return
            Click(i, ip)()
        }} click={Click(i, ip)}>
        {($pads[ip] & (1 << i)) ? 'O' : 'X'}
        </Box>
    {/each}

    </pad>
{/each}
</Box>
<svelte:window on:mousedown={(e) => {
    left = true
}}  on:mouseup={() => {
    left = false  
}}/>
<style>
pad {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
}
</style>
