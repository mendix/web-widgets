import { createElement, InputHTMLAttributes, ReactElement, useEffect, useRef } from "react";
import classNames from "classnames";

export type ThreeStateCheckBoxEnum = "all" | "some" | "none";

export interface ThreeStateCheckBoxProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, "checked" | "value" | "type"> {
    value: ThreeStateCheckBoxEnum;
}

export function ThreeStateCheckBox({ value, className, ...props }: ThreeStateCheckBoxProps): ReactElement {
    const checkboxRef = useRef<HTMLInputElement | null>(null);
    useEffect(() => {
        if (!checkboxRef.current) {
            return;
        }
        if (value === "all" || value === "none") {
            checkboxRef.current.indeterminate = false;
        } else if (value === "some") {
            checkboxRef.current.indeterminate = true;
        }
    }, [value]);

    return (
        <input
            {...props}
            type="checkbox"
            className={classNames("three-state-checkbox", className)}
            ref={checkboxRef}
            checked={value !== "none"}
        />
    );
}
