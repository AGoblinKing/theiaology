<script lang="ts">

  import { modal_default, modal_visible } from '../editor'

  export let scale = 1
  // organize-imports-ignore

  function submit() {
    if (typeof modal_visible.$ !== 'function') {
      return
    }
    modal_visible.$(val * scale)
  }

  let escape = false
  function keydown(e: KeyboardEvent) {
    switch (e.key) {
      case 'Escape':
        escape = true
        modal_visible.set(false)
        break
      case 'Enter':
        submit()
        break
    }
  }

  let val = $modal_default/scale

  let ele

  $: {
    if (ele) {
      ele.select()
    }
  }
</script>

<input
  on:blur={submit}
  on:mouseout={submit}
  type="number"
  bind:value={val}
  step={0.01}
  autofocus
  bind:this={ele}
  on:keydown={keydown}
  class="span"
/>

<style>
  .span {
    font-size: 1.5rem;
    width: 8rem;
    grid-column: span 4;
  }
</style>
