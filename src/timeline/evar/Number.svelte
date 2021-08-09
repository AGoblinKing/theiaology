<script lang="ts">
  import { modal_default, modal_visible } from '../editor'

  // organize-imports-ignore

  function submit() {
    if (typeof modal_visible.$ !== 'function') {
      return
    }
    modal_visible.$(val)
  }

  function keydown(e: KeyboardEvent) {
    switch (e.key) {
      case 'Escape':
        modal_visible.set(false)
        break
      case 'Enter':
        submit()
        break
    }
  }

  let val = $modal_default

  let ele

  $: {
    if (ele) {
      ele.select()
    }
  }
</script>

<input
  type="number"
  bind:value={val}
  autofocus
  bind:this={ele}
  on:keydown={keydown}
  class="span"
/>

<style>
  .span {
    grid-column: span 3;
  }
</style>
