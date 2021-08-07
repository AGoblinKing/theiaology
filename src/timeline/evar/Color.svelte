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
      case 'Enter':
        submit()
        break
    }
  }

  let val = $modal_default
</script>

<input type="color" bind:value={val} autofocus on:keydown={keydown} />
