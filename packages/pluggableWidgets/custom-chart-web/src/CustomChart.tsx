import { getPlaygroundContext } from "@mendix/shared-charts/main";
import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { createElement, Fragment, ReactElement, useEffect } from "react";
import { CustomChartContainerProps } from "../typings/CustomChartProps";
import { Host } from "./controllers/Host";
import { useCustomChart } from "./hooks/useCustomChart";
import "./ui/CustomChart.scss";
import { usePlaygroundData } from "./hooks/usePlaygroundData";

const PlaygroundContext = getPlaygroundContext();

export default function CustomChart(props: CustomChartContainerProps): ReactElement {
    const host = useSetup(() => new Host());
    const { chartRef, containerStyle, data, layout, config } = useCustomChart(props);

    useEffect(() => {
        if (props.eventDataAttribute?.value && props.onClick) {
            executeAction(props.onClick);
            // reset to allow re-click on same spot
            props.eventDataAttribute.setValue("");
        }
    }, [props.eventDataAttribute?.value]);

    const ref = mergeRefs<HTMLDivElement>(chartRef, host.resizeCtrl.setTarget);
    const playgroundData = usePlaygroundData({ data, layout, config });
    console.info(data, props.dataAttribute, props.dataStatic, props.sampleData);

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
