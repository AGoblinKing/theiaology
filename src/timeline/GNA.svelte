<script lang="ts">
  // organize-imports-ignore

  import { timeline_shown } from './editor'
  import Timeline from './Timeline.svelte'
</script>

<toggle class="ribbon" on:click={() => timeline_shown.is(!$timeline_shown)}
  >THEIAOLOGY</toggle
>
<a
  class="ribbon github"
  href="https://github.com/agoblinking/Theia.games"
  target="_new">GITHUB</a
>

<gna class:hidden={!$timeline_shown}>
  <Timeline />
</gna>

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
    pointer-events: all;
    right: -5.5rem;
    font-size: 0.75rem;
    border: 0.25rem solid white;

    padding: 0.25rem 5rem;
    background-color: darkslategray;
  }

  gna {
    pointer-events: none;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    position: absolute;
  }

  .hidden {
    display: none;
  }
</style>
