import { ReactElement, createElement } from "react";

import { AnyChartPreviewProps } from "../typings/AnyChartProps";

export function preview(props: AnyChartPreviewProps): ReactElement {
    console.info("AnyChart", props);
    return <div>test</div>;
}
