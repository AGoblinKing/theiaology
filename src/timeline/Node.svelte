<script context="module">
  import { Color } from 'three'

  const col = new Color()
</script>

<script lang="ts">
  // organize-imports-ignore

  import { timeline_json } from 'src/buffer'
  import { ETimeline } from 'src/buffer/timeline'

  export let i = 0

  $: item = $timeline_json.flat[i] || { data: [], children: {} }
  $: label = i === 0 ? 'ROOT' : $timeline_json.markers[i] || i

  // show line number and data
</script>

{#if i === 0}
  {#each Object.keys($timeline_json.children).sort() as key}
    <svelte:self i={key} />
  {/each}
{/if}

<div class="node">
  <div class="items">
    {#if item.data.length > 0}
      <div class="flex">{item.data.join(':')}</div>
    {/if}
    <div class="upper">{ETimeline[item.data[1]] || 'root'}</div>

    {#if i === 0 || item.data[1] === ETimeline.Flock || item.data[1] === ETimeline.Marker}
      <div class="action">+</div>
    {:else}
      <div class="action">o</div>
    {/if}
    <div>#{i}</div>
    <div class="action">{i === 0 ? 'o' : '-'}</div>
  </div>
  <div class="children">
    {#each Object.keys(item.children) as key (key)}
      <svelte:self i={key} />
    {/each}
  </div>
</div>

<style>
  .children {
    background-color: rgba(2, 255, 213, 0.589);
    border-radius: 0 0 0 0.5rem;

    /*border: solid 0.25rem rgba(151, 2, 151, 0.555);*/
  }
  .upper {
    text-transform: uppercase;
  }
  .flex {
    flex: 1;
  }
  .action {
    cursor: pointer;
  }
  .node {
    margin-left: 2rem;
  }
  .items {
    border-radius: 0.1rem 0 0 0.1rem;
    display: flex;
  }

  .items div:hover {
    filter: sepia(0.5);
  }

  .items div {
    pointer-events: all;

    background-color: rgb(72, 2, 75);
    border: solid 0.1rem rgba(255, 255, 255, 0.418);
    color: rgb(250, 194, 9);
    font-size: 0.75rem;
    padding: 0.4rem;

    align-items: right;
    min-width: 0.5rem;
    justify-content: center;
    align-content: center;
    text-align: center;
  }
</style>
