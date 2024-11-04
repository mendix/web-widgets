import classNames from "classnames";
import { createElement, ReactElement } from "react";

type SpinnerLoaderProps = {
    size?: "small" | "medium" | "large";
    withMargins?: boolean;
};

export function SpinnerLoader({ size = "medium", withMargins = false }: SpinnerLoaderProps): ReactElement {
    return (
        <div
            className={classNames("widget-datagrid-spinner", { "widget-datagrid-spinner-margin": withMargins })}
            aria-busy
            aria-live="polite"
        >
            <div className={`widget-datagrid-spinner-loader widget-datagrid-spinner-loader-${size}`} />
        </div>
    );
}
