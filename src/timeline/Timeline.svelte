<script lang="ts">
  import { modal_visible } from './editor'

  import Modal from './Modal.svelte'

  // organize-imports-ignore
  import Node from './Node.svelte'
</script>

<div class="commands">
  <div>> THEIAOLOGY</div>
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
  }
  .commands div {
    background-color: rgb(72, 2, 75);
    border: solid 0.1rem rgba(255, 255, 255, 0.418);
    color: rgb(250, 194, 9);
    font-size: 0.75rem;
    padding: 0.4rem;
    cursor: pointer;
  }
  .commands div:hover {
    filter: sepia(0.5);
  }
  .nodes {
    direction: ltr;
  }
  .timeline {
    transition: all ease-in-out 0.25s;
    display: flex;
    flex-direction: column;
    border-top: 0.1rem solid rgba(255, 255, 255, 0.418);

    flex: 1;
    overflow-y: scroll;
    pointer-events: all;
    direction: rtl;
    text-shadow: rgb(0, 0, 0) 0.075rem 0.075rem 0rem;
    scroll-behavior: smooth;
  }

  .timeline::-webkit-scrollbar {
    width: 1rem;
    background-color: rgba(2, 91, 255, 0.288);
  }

  .timeline::-webkit-scrollbar-thumb {
    background: rgba(0, 28, 189, 0.842);
    outline: 1px solid slategrey;
    max-height: 5rem;
  }
</style>
