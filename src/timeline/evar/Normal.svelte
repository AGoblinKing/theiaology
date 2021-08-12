<script>
  import { NORMALIZER } from 'src/config'

  import Box from '../Box.svelte'

  import { modal_default, modal_visible } from '../editor'
  let val = modal_default.$
  // organize-imports-ignore
</script>

<input
  type="range"
  name="range"
  min="0"
  bind:value={val}
  max={NORMALIZER}
  class="range"
  on:change={(e) => {
    modal_visible.$(e.target.value)
  }}
/>
<Box
  ><label for="range">{Math.abs((val / NORMALIZER) * 100).toFixed(0)}%</label
  ></Box
>

<style>
  .range {
    grid-column: span 2;
  }
</style>
