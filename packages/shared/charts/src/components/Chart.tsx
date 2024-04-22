import { createElement, Fragment } from "react";
import { getPlaygroundContext, PlaygroundData } from "../helpers/playground-context";
import { useChartController } from "../helpers/useChartController";
import { ChartView } from "./ChartView";
import { ChartProps } from "./types";

const PlaygroundContext = getPlaygroundContext();

export type { ChartProps };
export function Chart(props: ChartProps): React.ReactElement {
    let playgroundData: PlaygroundData;
    [props, playgroundData] = useChartController(props, { playgroundOn: !!props.playground });

    return (
        <Fragment>
            <ChartView {...props} />
            <PlaygroundContext.Provider value={playgroundData}>{props.playground}</PlaygroundContext.Provider>
        </Fragment>
    );
}
