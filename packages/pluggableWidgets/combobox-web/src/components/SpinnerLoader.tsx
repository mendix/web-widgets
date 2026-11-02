import classNames from "classnames";
import { ReactElement } from "react";
import { classes } from "./classes";
import { legacy } from "./legacyModifiers";

type SpinnerLoaderProps = {
    size?: "small" | "medium";
    withMargins?: boolean;
};

export function SpinnerLoader({ size = "medium", withMargins = false }: SpinnerLoaderProps): ReactElement {
    return (
        <div
            className={classNames(classes.spinner, { [legacy.spinnerMargins]: withMargins })}
            data-margins={withMargins || undefined}
        >
            <div
                className={classNames(classes.spinnerIcon, { [legacy.spinnerSmall]: size === "small" })}
                data-size={size === "small" ? "small" : undefined}
            />
        </div>
    );
}
