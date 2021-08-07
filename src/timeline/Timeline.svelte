<script lang="ts">
  // organize-imports-ignore
  import Node from './Node.svelte'
</script>

<div class="commands">
  <div>AUDIO</div>
  <div>VOX</div>
  <div>LOAD</div>
  <div>SAVE</div>
</div>
<div class="timeline">
  <div class="nodes">
    <Node />
  </div>
</div>

<style>
  .commands {
    pointer-events: all;
    display: flex;
    position: absolute;
    top: 0;
    left: 0;
  }
  .commands div {
    background-color: rgb(72, 2, 75);
    border: solid 0.1rem rgba(255, 255, 255, 0.418);
    color: rgb(250, 194, 9);
    font-size: 0.75rem;
    padding: 0.4rem;
  }
  .commands div:hover {
    filter: sepia(0.5);
  }
  .nodes {
    direction: ltr;
  }
  .timeline {
    display: flex;
    order: reverse;
    flex-direction: column;
    position: absolute;
    top: 1.75rem;
    left: 0;
    height: 100%;
    overflow-y: scroll;
    direction: rtl;
    scroll-behavior: smooth;
  }
</style>
