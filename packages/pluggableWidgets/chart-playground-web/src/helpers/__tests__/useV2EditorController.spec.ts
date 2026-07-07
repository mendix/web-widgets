import "./stubObjectURL";
import { act, renderHook } from "@testing-library/react";
import { observable } from "mobx";
import { EditableChartStore, EditableChartStoreProps, PlaygroundDataV2 } from "@mendix/shared-charts/main";
import { SetupHost } from "@mendix/widget-plugin-mobx-kit/main";
import { useV2EditorController } from "../useV2EditorController";

class TestHost extends SetupHost {}

function makeContext(initial: EditableChartStoreProps): { context: PlaygroundDataV2; dispose: () => void } {
    const props = observable.box<EditableChartStoreProps>(initial, { deep: false });
    const host = new TestHost();
    const store = new EditableChartStore(host, { get: () => props.get() });
    const dispose = host.setup();
    return {
        context: {
            type: "editor.data.v2",
            store,
            plotData: initial.data,
            layoutOptions: {},
            configOptions: {}
        },
        dispose
    };
}

describe("useV2EditorController", () => {
    it("does not clobber the user's in-progress edit with the store's reformatted echo", () => {
        const { context, dispose } = makeContext({ layout: { a: 1 }, config: {}, data: [] });
        const { result } = renderHook(() => useV2EditorController(context));

        act(() => {
            // Compact, single-line input — the store round-trips this through
            // JSON.parse/JSON.stringify and the reaction re-derives `code` via
            // prettifyJson, which would reformat it to multiple lines.
            result.current.onEditorChange('{"a":1,"b":2}');
        });

        // The value shown to the user must remain exactly what they typed,
        // not get replaced by the store's reformatted echo of that same edit.
        expect(result.current.value).toBe('{"a":1,"b":2}');

        dispose();
    });

    it("keeps onViewSelectChange identity stable across re-renders", () => {
        const { context, dispose } = makeContext({ layout: { a: 1 }, config: {}, data: [] });

        const { result, rerender } = renderHook(() => useV2EditorController(context));
        const first = result.current.onViewSelectChange;

        rerender();

        expect(result.current.onViewSelectChange).toBe(first);

        dispose();
    });

    it("tracks the selected view without desyncing value and editor code", () => {
        const { context, dispose } = makeContext({
            layout: { a: 1 },
            config: { b: 2 },
            data: [{ name: "t0", x: [1] }]
        });

        const { result } = renderHook(() => useV2EditorController(context));

        expect(result.current.viewSelectValue).toBe("layout");
        expect(JSON.parse(result.current.value)).toEqual({ a: 1 });

        act(() => result.current.onViewSelectChange("config"));
        expect(result.current.viewSelectValue).toBe("config");
        expect(JSON.parse(result.current.value)).toEqual({ b: 2 });

        act(() => result.current.onViewSelectChange("0"));
        expect(result.current.viewSelectValue).toBe("0");
        expect(JSON.parse(result.current.value)).toEqual({ name: "t0", x: [1] });

        dispose();
    });
});
