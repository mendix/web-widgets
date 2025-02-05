import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";
import { ReactElement, createElement } from "react";
import { CustomChartContainerProps } from "../typings/CustomChartProps";
import { useCustomChart } from "./hooks/useCustomChart";
import { useActionEvents } from "./hooks/useActionEvents";
import "./ui/CustomChart.scss";
import { Host } from "./controllers/Host";

export default function CustomChart(props: CustomChartContainerProps): ReactElement {
    const host = useSetup(() => new Host());
    const { chartRef, containerStyle } = useCustomChart(props);
    const { handleClick } = useActionEvents(props);

    const x = mergeRefs<HTMLDivElement>(chartRef, host.resizeCtrl.setTarget);
    return (
        <div
            ref={x}
            className="widget-custom-chart"
            style={containerStyle}
            tabIndex={props.tabIndex}
            onClick={handleClick}
        />
    );
}

export function mergeRefs<T>(...refs: Array<React.Ref<T>>): React.Ref<T> | React.RefCallback<T> | undefined {
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
