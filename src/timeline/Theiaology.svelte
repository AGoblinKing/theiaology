<script lang="ts">
  // organize-imports-ignore

  import { timeline_shown } from './editor'
  import Timeline from './Timeline.svelte'
  import Modal from './Modal.svelte'
</script>

<toggle class="ribbon" on:click={() => timeline_shown.set(!$timeline_shown)}
  >THEIAOLOGY</toggle
>
<a
  class="ribbon github"
  href="https://github.com/agoblinking/Theia.games"
  target="_new">GITHUB</a
>

{#if $timeline_shown}
  <Modal />
  <gna>
    <Timeline />
  </gna>
{/if}

<style>
  .ribbon {
    transition: all 0.2s ease-in-out;
    cursor: pointer;
    position: absolute;
    z-index: 1;
    padding: 0.5rem 5rem;
    color: white;
    text-decoration: none;
    text-align: center;
    transform: rotate(45deg);
    text-shadow: rgb(0, 0, 0) 0.075rem 0.075rem 0rem;
  }

  .ribbon:hover {
    background-color: rgb(7, 136, 179);
  }

  toggle {
    top: 2.5rem;
    right: -6.5rem;
    pointer-events: all;
    font-size: 1rem;
    border: 0.5rem solid white;

    background-color: darkslateblue;
  }

  .github {
    top: 1rem;
    text-shadow: rgb(0, 0, 0) 0.075rem 0.075rem 0rem;
    pointer-events: all;
    right: -5.5rem;
    font-size: 0.75rem;
    border: 0.25rem solid white;

    padding: 0.25rem 5rem;
    background-color: darkslategray;
  }

  gna {
    display: flex;
    flex-direction: column;
    pointer-events: none;
    top: 0;
    left: 0;

    height: 100%;
    position: absolute;
    z-index: 1000;
  }

  .hidden {
    display: none;
  }
</style>
