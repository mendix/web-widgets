import classNames from "classnames";
import { Fragment, MouseEvent, ReactElement } from "react";
import { Caption } from "./Caption";
import { legacy } from "./legacyModifiers";
import { useComboboxClasses } from "../hooks/useComboboxClasses";

export function ClearButton({ size = 14 }): ReactElement {
    const classes = useComboboxClasses();
    return (
        <span className={classes.icon}>
            <svg width={size} height={size} viewBox="0 0 32 32" className={classes.clearIcon}>
                <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="currentColor"
                    d="M27.71 5.71004L26.29 4.29004L16 14.59L5.71004 4.29004L4.29004 5.71004L14.59 16L4.29004 26.29L5.71004 27.71L16 17.41L26.29 27.71L27.71 26.29L17.41 16L27.71 5.71004Z"
                />
            </svg>
        </span>
    );
}

/** The chevron of the toggle. It turns when the toggle element carries `data-open`. */
export function DownArrow({ isOpen }: { isOpen?: boolean }): ReactElement {
    const classes = useComboboxClasses();
    return (
        <span className={classes.icon}>
            <svg
                className={classNames(classes.toggleIcon, "mx-icon-lined", "mx-icon-chevron-down", {
                    [legacy.toggleIconOpen]: isOpen
                })}
                width="16"
                height="16"
                viewBox="0 0 32 32"
            >
                <path d="M16 23.41L4.29004 11.71L5.71004 10.29L16 20.59L26.29 10.29L27.71 11.71L16 23.41Z" />
            </svg>
        </span>
    );
}

interface CheckboxProps {
    checked: boolean | undefined;
    id?: string;
    focusable?: boolean;
    onClick?: (e: MouseEvent<HTMLInputElement>) => void;
    ariaLabel?: string;
}

export function Checkbox({ checked, id, focusable, onClick, ariaLabel }: CheckboxProps): ReactElement {
    const classes = useComboboxClasses();
    return (
        <Fragment>
            <span className={classes.icon}>
                <input
                    type="checkbox"
                    tabIndex={focusable ? 0 : -1}
                    checked={checked}
                    id={id}
                    role="presentation"
                    onClick={
                        onClick
                            ? onClick
                            : (e: MouseEvent<HTMLInputElement>) => {
                                  e.preventDefault();
                              }
                    }
                    onChange={() => {}}
                />
            </span>
            {ariaLabel ? <Caption htmlFor={id}>{ariaLabel}</Caption> : undefined}
        </Fragment>
    );
}
