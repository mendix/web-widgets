import { createElement, useState } from "react";

type newPlot = typeof import("plotly.js/lib/core").newPlot;

async function load(): Promise<newPlot> {
    const { newPlot } = await import("plotly.js/lib/core");
    return newPlot;
}

export function DITest(): React.ReactElement {
    const [newPlot, setNewPlotFn] = useState<newPlot>();
    const [onClick] = useState(() => async () => {
        const np = await load();
        setNewPlotFn((prev: newPlot | undefined) => prev ?? np);
    });

    return <div onClick={onClick}>DITest {typeof newPlot} and other!</div>;
}
