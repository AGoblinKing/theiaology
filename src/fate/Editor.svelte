<script lang="ts">
    import { first } from "src/realm"
    import { onDestroy } from "svelte";

    // @ts-ignore
    let mirror = CodeMirror(document.body, {
        value: first.$.fate.$.toScript(),
        mode:  "text/x-common-lisp",
        dragDrop: false
    });

    onDestroy(() => {
        mirror.off("changes", update)
        mirror.getWrapperElement().parentNode.removeChild(mirror.getWrapperElement());
        mirror = undefined
    })

    const update = () => {
        const f = first.$.fate.$
        f.fromScript(f.text(0), mirror.getValue())
        first.$.fate.poke()
    }

    mirror.on("changes", update)
</script>

<style>

:global(.CodeMirror) {
    position: absolute !important;
    right: 0;
    top: 0;
    height: 100% !important;
    width: 30rem !important;
}
</style>