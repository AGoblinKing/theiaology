<script>
  import { audio } from 'src/sound/audio'
  import Box from '../Box.svelte'
  import { modal_default, modal_visible } from '../editor'
  function d0(t) {
    return `00${Math.floor(t)}`.slice(-2)
  }
  // organize-imports-ignore

  let val = modal_default.$
</script>

<input
  type="range"
  min="0"
  name="range"
  step="0.1"
  bind:value={val}
  max={audio.duration}
  class="time"
  on:change={(e) => {
    modal_visible.$(e.target.value)
  }}
/>

<Box><label for="range">{d0(val / 60)}:{d0(val % 60)}</label></Box>

<style>
  .time {
    grid-column: span 3;
  }
</style>
