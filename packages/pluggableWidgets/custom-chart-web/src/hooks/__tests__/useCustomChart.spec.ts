import "./stubObjectURL";
import { render, renderHook, screen, waitFor } from "@testing-library/react";
import { observer } from "mobx-react-lite";
import { createElement, ReactElement } from "react";
import { PlaygroundDataV2 } from "@mendix/shared-charts/main";
import { CustomChartContainerProps } from "../../../typings/CustomChartProps";
import { useCustomChart } from "../useCustomChart";

function props(overrides: Partial<CustomChartContainerProps> = {}): CustomChartContainerProps {
    return {
        name: "chart",
        class: "",
        tabIndex: 0,
        dataStatic: "[]",
        sampleData: "",
        showPlaygroundSlot: true,
        layoutStatic: "{}",
        sampleLayout: "",
        configurationOptions: "{}",
        widthUnit: "percentage",
        width: 100,
        heightUnit: "percentageOfWidth",
        height: 75,
        minHeightUnit: "none",
        minHeight: 0,
        maxHeightUnit: "none",
        maxHeight: 0,
        OverflowY: "auto",
        ...overrides
    } as CustomChartContainerProps;
}

describe("useCustomChart", () => {
    it("passes the adapter's parsed layout and config into playgroundData (not empty objects)", () => {
        const { result } = renderHook(() =>
            useCustomChart(
                props({
                    layoutStatic: JSON.stringify({ title: "X" }),
                    configurationOptions: JSON.stringify({ displaylogo: true })
                })
            )
        );

        const data = result.current.playgroundData as PlaygroundDataV2;

        expect(data.layoutOptions).toMatchObject({ title: "X" });
        expect(data.configOptions).toMatchObject({ displaylogo: true });
    });

    it("returns only playgroundData and ref (no dead containerStyle)", () => {
        const { result } = renderHook(() => useCustomChart(props()));

        expect(Object.keys(result.current).sort()).toEqual(["playgroundData", "ref"]);
    });

    it("stays reactive to the store's parsed traces when rendered inside an observer", async () => {
        // Mirrors CustomChart.tsx: the hook is consumed by an observer component, which
        // re-renders once the store's setup autorun loads the parsed data.
        const Probe = observer(function Probe(p: CustomChartContainerProps): ReactElement {
            const { playgroundData } = useCustomChart(p);
            const data = playgroundData as PlaygroundDataV2;
            return createElement("output", {}, JSON.stringify({ type: data.type, plotData: data.plotData }));
        });

        render(createElement(Probe, props({ dataStatic: JSON.stringify([{ type: "bar", x: [1], y: [2] }]) })));

        await waitFor(() => {
            const parsed = JSON.parse(screen.getByRole("status").textContent ?? "{}");
            expect(parsed.type).toBe("editor.data.v2");
            expect(parsed.plotData).toEqual([{ type: "bar", x: [1], y: [2] }]);
        });
    });
});
