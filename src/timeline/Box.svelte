<script lang="ts">
  export let flex = false
  export let upper = false
  export let click = (e: any) => {}
</script>

<div class="box" class:flex class:upper on:click={click}>
  <slot />
</div>

<style>
  .upper {
    text-transform: uppercase;
  }
  .flex {
    flex: 1;
  }
  .box {
    text-shadow: rgb(0, 0, 0) 0.075rem 0.075rem 0rem;
    background-color: rgb(72, 2, 75);
    border: solid 0.1rem rgba(255, 255, 255, 0.418);
    color: rgb(250, 194, 9);
    font-size: 0.75rem;
    padding: 0.4rem;
    text-align: center;
    pointer-events: all;
    min-width: 0.5rem;
    cursor: pointer;
    align-items: right;

    display: flex;
    justify-content: center;
    align-content: center;
  }

  .box:hover {
    filter: sepia(0.5) hue-rotate(90deg);
  }
</style>
