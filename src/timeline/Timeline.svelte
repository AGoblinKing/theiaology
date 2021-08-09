<script lang="ts">
  import { Load } from 'src/file/load'

  import { Save } from 'src/file/save'
  import Box from './Box.svelte'

  // organize-imports-ignore
  import Node from './Node.svelte'

  async function loadFile(event) {
    const reader = new FileReader()
    reader.addEventListener('load', (e: any) => {
      Load(e.target.result)
    })
    try {
      reader.readAsArrayBuffer(event.target.files[0])
    } catch (ex) {}
  }
</script>

<div class="commands">
  <Box nav={{ tag: 'theiaology', right: 'load', left: 'save', down: 'root' }}
    >> THEIAOLOGY</Box
  >
  <Box nav={{ tag: 'load', left: 'theiaology', right: 'save', down: 'root' }}
    ><input
      id="load"
      type="file"
      title="LOAD"
      accept=".theia"
      on:change={loadFile}
    />
    <label for="load">LOAD</label></Box
  >
  <Box
    nav={{ tag: 'save', right: 'theiaology', left: 'load', down: 'root' }}
    click={Save}>SAVE</Box
  >
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
  label {
    cursor: pointer;
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
