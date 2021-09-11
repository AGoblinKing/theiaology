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
  type="text"
  on:blur={submit}
  on:mouseout={submit}
  bind:this={ele}
  bind:value={val}
  autofocus
  maxlength="12"
  on:keydown={keydown}
  class="modal"
/>

<style>
  .modal {
    column-span: all;
    font-size: 1.5rem;
    width: 18.5rem;
    padding: 1rem;

    grid-column: span 4;
  }
</style>
