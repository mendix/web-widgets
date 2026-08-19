import { Fragment, ReactElement } from "react";
import { ChartView } from "./ChartView";
import { ChartProps } from "./types";
import { getPlaygroundContext, PlaygroundData } from "../helpers/playground-context";
import { useChartController } from "../helpers/useChartController";

const PlaygroundContext = getPlaygroundContext();

export type { ChartProps };
export function Chart(props: ChartProps): ReactElement {
    let playgroundData: PlaygroundData;
    [props, playgroundData] = useChartController(props, { playgroundOn: !!props.playground });

    return (
        <Fragment>
            <ChartView {...props} />
            <PlaygroundContext.Provider value={playgroundData}>{props.playground}</PlaygroundContext.Provider>
        </Fragment>
    );
}
