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
</script>

<input
  type="text"
  bind:value={val}
  autofocus
  maxlength="12"
  on:keydown={keydown}
  class="modal"
/>

<style>
  .modal {
    font-size: 1.5rem;
    width: 18.5rem;
    padding: 1rem;
  }
</style>
