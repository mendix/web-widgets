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

    return (
        <div
            ref={host.resizeCtrl.setTarget}
            className="widget-custom-chart"
            style={containerStyle}
            tabIndex={props.tabIndex}
            onClick={handleClick}
        />
    );
}
