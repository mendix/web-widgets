jest.mock("plotly.js-dist-min", () => ({}));
jest.mock("react-plotly.js", () => jest.fn(() => null));
jest.mock("react-plotly.js/factory", () => jest.fn(() => jest.fn(() => null)));

import { act, renderHook } from "@testing-library/react";
import { EditableChartStore, PlaygroundDataV2 } from "@mendix/shared-charts/main";
import { useV2EditorController } from "../useV2EditorController";

function setupData(): PlaygroundDataV2 {
    const host = { add: () => {} };
    const props = { get: () => ({ layout: {}, config: {}, data: [] }) };
    const store = new EditableChartStore(host as any, props as any);
    return {
        type: "editor.data.v2",
        store,
        plotData: [],
        configOptions: {},
        layoutOptions: {}
    };
}

describe("useV2EditorController", () => {
    it("does not clobber the user's in-progress edit with the store's reformatted echo", () => {
        const data = setupData();
        const { result } = renderHook(() => useV2EditorController(data));

        act(() => {
            // Compact, single-line input — the store round-trips this through
            // JSON.parse/JSON.stringify and the reaction re-derives `code` via
            // prettifyJson, which would reformat it to multiple lines.
            result.current.onEditorChange('{"a":1,"b":2}');
        });

        // The value shown to the user must remain exactly what they typed,
        // not get replaced by the store's reformatted echo of that same edit.
        expect(result.current.value).toBe('{"a":1,"b":2}');
    });
});
