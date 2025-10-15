import classNames from "classnames";
import { ReactElement } from "react";

type SpinnerLoaderProps = {
    size?: "small" | "medium" | "large";
    withMargins?: boolean;
    fullWidth?: boolean;
};

export function SpinnerLoader({
    size = "medium",
    withMargins = false,
    fullWidth = true
}: SpinnerLoaderProps): ReactElement {
    return (
        <div
            className={classNames("widget-datagrid-spinner", {
                "widget-datagrid-spinner-margin": withMargins,
                "widget-datagrid-spinner-full-width": fullWidth
            })}
            aria-busy
            aria-live="polite"
        >
            <div className={`widget-datagrid-spinner-loader widget-datagrid-spinner-loader-${size}`} />
        </div>
    );
}
