import classNames from "classnames";
import { createElement, ReactElement } from "react";

type SpinnerLoaderProps = {
    size?: "small" | "medium";
    withMargins?: boolean;
};

export function SpinnerLoader({ size = "medium", withMargins = false }: SpinnerLoaderProps): ReactElement {
    return (
        <div className={classNames("widget-combobox-spinner", { "widget-combobox-spinner-margin": withMargins })}>
            <div
                className={classNames("widget-combobox-spinner-loader", {
                    "widget-combobox-spinner-loader-small": size === "small"
                })}
            />
        </div>
    );
}
