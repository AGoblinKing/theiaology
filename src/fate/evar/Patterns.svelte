<script>
import Box from "../Box.svelte";

import { modal_default, modal_visible } from "../editor";
import Pattern from "./Pattern.svelte";

let val = modal_default.$

const patterns = [...new Array(85)].map((_, i) => i - 1)
</script>

<div class="patterns">
{#each patterns as i (i)} 
    <Box click={() => {
       modal_visible.$(i) 
    }}><Pattern {i} size={2} /></Box>
{/each}
</div>

<style>

.patterns {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
}
</style>


