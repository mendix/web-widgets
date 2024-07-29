import { ReactElement, createElement } from "react";
import classNames from "classnames";

export interface BadgeSampleProps {
    className?: string;
}

export type BootstrapStyle = "default" | "info" | "inverse" | "primary" | "danger" | "success" | "warning";

export function BadgeSample(props: BadgeSampleProps): ReactElement {
    console.info(props);
    return <span className={classNames("widget-dynamicgrid")}>"badge"</span>;
}
