<script>
  import { modal_default, modal_visible } from '../editor'

  // organize-imports-ignore
</script>

<input
  type="range"
  name="range"
  min="0"
  max={Number.MAX_SAFE_INTEGER}
  value={modal_default.$}
  class="range"
  on:change={(e) => {
    modal_visible.$(e.target.value)
  }}
/>

<style>
  .range {
    grid-column: span 3;
  }
</style>
