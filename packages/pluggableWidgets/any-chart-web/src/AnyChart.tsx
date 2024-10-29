import { ReactElement, createElement } from "react";
import { AnyChartContainerProps } from "../typings/AnyChartProps";

export function AnychartWeb(props: AnyChartContainerProps): ReactElement {
    console.info("AnyChart", props);
    return (
        <div>
            <p>Data</p>
            <p>Data static: {props.dataStatic}</p>
            <p>Data attribute: {props.dataAttribute?.value}</p>
            <p>Sample: {props.sampleData}</p>
            <p>Dev mode: {props.devMode}</p>
            <br />

            <p>Layout options</p>
            <p>Layout static: {props.layoutStatic}</p>
            <p>Layout attribute: {props.layoutAttribute?.value}</p>
            <p>Sample: {props.sampleLayout}</p>
            <br />

            <p>Configuration</p>
            <p>Configuration: {props.configurationOptions}</p>
            <br />

            <p>Sizing</p>
            <p>Width unit: {props.widthUnit}</p>
            <p>Width: {props.width}</p>
            <p>Height unit: {props.heightUnit}</p>
            <p>Height: {props.height}</p>
            <br />

            <p>Common</p>
            <p>Name: {props.name}</p>
            <p>Tab index: {props.tabIndex}</p>
            <br />
        </div>
    );
}
