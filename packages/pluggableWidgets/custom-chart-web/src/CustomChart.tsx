import { getPlaygroundContext } from "@mendix/shared-charts/main";
import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";
import { createElement, Fragment, ReactElement } from "react";
import { CustomChartContainerProps } from "../typings/CustomChartProps";
import { Host } from "./controllers/Host";
import { useCustomChart } from "./hooks/useCustomChart";
import "./ui/CustomChart.scss";

const PlaygroundContext = getPlaygroundContext();

export default function CustomChart(props: CustomChartContainerProps): ReactElement {
    const host = useSetup(() => new Host());
    const { chartRef, containerStyle, playgroundData } = useCustomChart(props);
    const ref = mergeRefs<HTMLDivElement>(chartRef, host.resizeCtrl.setTarget);

    return (
        <Fragment>
            <div ref={ref} className="widget-custom-chart" style={containerStyle} tabIndex={props.tabIndex} />
            <PlaygroundContext.Provider value={playgroundData}>{props.playground}</PlaygroundContext.Provider>
        </Fragment>
    );
}

function mergeRefs<T>(...refs: Array<React.Ref<T>>): React.Ref<T> | React.RefCallback<T> | undefined {
    if (refs.length === 0) {
        return undefined;
    } else if (refs.length === 1) {
        return refs[0];
    } else {
        return ref => {
            for (const x of refs) {
                if (typeof x === "function") {
                    x(ref);
                } else if (x) {
                    (x as React.MutableRefObject<T | null>).current = ref;
                }
            }
        };
    }
}
