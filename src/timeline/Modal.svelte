<script lang="ts">
  import { EVar } from 'src/buffer/timeline'
  import String from './evar/String.svelte'
  import { mouse_left } from 'src/input/mouse'

  // organize-imports-ignore
  import { modal_options, modal_location, modal_visible } from './editor'

  // modal is a singleton so Aok, but weird
  mouse_left.on(() => {
    modal_visible.set(false)
  })
</script>

{#if $modal_visible}
  <div
    class="modal"
    style="left: {$modal_location.x}px; top: {$modal_location.y}px"
  >
    {#if Array.isArray($modal_options)}
      {#each $modal_options as content}
        <div
          class="item"
          on:click={() => {
            if (typeof $modal_visible === 'function') $modal_visible(content)
            modal_visible.set(false)
          }}
        >
          {content}
        </div>
      {/each}
    {:else if $modal_options === EVar.String}
      <String />
    {/if}
  </div>
{/if}

<style>
  .item {
    text-align: center;
    padding: 0.4rem;
    transition: all 250ms ease-in-out;
    cursor: pointer;
    border-bottom: 0.1rem solid rgba(255, 255, 255, 0.541);
  }
  .item:hover {
    filter: sepia(0.5) hue-rotate(90deg);
  }

  .modal {
    pointer-events: all;
    position: absolute;
    background-color: rgb(72, 2, 75);
    border: solid 0.1rem rgba(255, 255, 255, 0.418);
    color: rgb(250, 194, 9);
    font-size: 0.5rem;

    z-index: 1001;
    text-shadow: rgb(0, 0, 0) 0.075rem 0.075rem 0rem;
  }
</style>
