<script lang="ts">
    import { first } from "src/realm"
    import { onDestroy } from "svelte";

    // @ts-ignore
    let mirror = CodeMirror(document.body, {
        value: first.$.fate.$.toScript(),
        mode:  "commonlisp",
        dragDrop: false,
        theme: "erlang-dark",
        save: () => {
            console.log("hlelo")
        }
    });

    // @ts-ignore
    window.mirror = mirror;

    onDestroy(() => {
        mirror.off("changes", update)
        mirror.getWrapperElement().parentNode.removeChild(mirror.getWrapperElement());
        mirror = undefined
        cancel()
    })

    let clutch = false
    let reverseClutch = false

    const cancel = first.$.fate.on(() => {
        if(reverseClutch) return

        clutch = true
        mirror.setValue(first.$.fate.$.toScript())
        clutch = false
    })

    const update = () => {
        if(clutch) return

        const f = first.$.fate.$
        f.fromScript(f.text(0), mirror.getValue())
        reverseClutch = true
        first.$.fate.poke()
        reverseClutch = false
    }


    mirror.on("changes", update)
</script>

<style>

:global(.CodeMirror) {
    position: absolute !important;
    right: 0;
    top: 0;
    height: 100% !important;
    width: 35rem !important;
    padding-left: 0.1rem;
    background-color: rgba(15, 25, 42, 0.8) !important;
}
</style>