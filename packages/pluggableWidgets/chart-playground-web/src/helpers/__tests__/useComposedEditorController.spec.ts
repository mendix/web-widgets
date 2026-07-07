import "./stubObjectURL";
import { act, renderHook } from "@testing-library/react";
import { EditorStore, PlaygroundDataV1 } from "@mendix/shared-charts/main";
import { useComposedEditorController } from "../useComposedEditorController";

function setupData(): PlaygroundDataV1 {
    const store = new EditorStore();
    store.reset({ layout: '{"a":1}', config: "{}", data: [] });
    return {
        plotData: [],
        store,
        configOptions: {},
        layoutOptions: {}
    };
}

describe("useComposedEditorController", () => {
    it("does not clobber the user's in-progress edit with the store's reformatted echo", () => {
        const data = setupData();
        const { result } = renderHook(() => useComposedEditorController(data));

        act(() => {
            // Compact, single-line input — the store round-trips this through
            // JSON.parse/JSON.stringify and the hook re-derives `code` via
            // prettifyJson, which would reformat it to multiple lines.
            result.current.onEditorChange('{"a":1,"b":2}');
        });

        // The value shown to the user must remain exactly what they typed,
        // not get replaced by the store's reformatted echo of that same edit.
        expect(result.current.value).toBe('{"a":1,"b":2}');
    });

    it("keeps onViewSelectChange identity stable across re-renders", () => {
        const data = setupData();
        const { result, rerender } = renderHook(() => useComposedEditorController(data));
        const first = result.current.onViewSelectChange;

        rerender();

        expect(result.current.onViewSelectChange).toBe(first);
    });
});
