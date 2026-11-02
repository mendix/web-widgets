import classNames from "classnames";
import { ReactElement } from "react";
import { legacy } from "./legacyModifiers";
import { useComboboxClasses } from "../hooks/useComboboxClasses";

type SpinnerLoaderProps = {
    size?: "small" | "medium";
    withMargins?: boolean;
};

export function SpinnerLoader({ size = "medium", withMargins = false }: SpinnerLoaderProps): ReactElement {
    const classes = useComboboxClasses();
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
