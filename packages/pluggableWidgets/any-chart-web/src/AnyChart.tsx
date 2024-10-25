import { ReactElement, createElement } from "react";
import { AnyChartContainerProps } from "../typings/AnyChartProps";

export function AnychartWeb(props: AnyChartContainerProps): ReactElement {
    console.info("AnyChart", props);
    return (
        <div>
            <p>test</p>
        </div>
    );
}
