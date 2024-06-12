import classNames from "classnames";
import { createElement, ReactElement } from "react";

type SpinnerLoaderProps = {
    size?: "small" | "medium";
};

export function SpinnerLoader({ size = "medium" }: SpinnerLoaderProps): ReactElement {
    return (
        <div className="widget-combobox-spinner">
            <div
                className={classNames("widget-combobox-spinner-loader", {
                    "widget-combobox-spinner-loader-small": size === "small"
                })}
            />
        </div>
    );
}
