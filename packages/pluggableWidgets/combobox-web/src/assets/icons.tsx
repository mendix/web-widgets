import classNames from "classnames";
import { MouseEvent, ReactElement, createElement, Fragment } from "react";
import { CaptionContent } from "../helpers/Association/AssociationSimpleCaptionsProvider";

export function ClearButton({ size = 14 }): ReactElement {
    return (
        <span className="widget-combobox-icon-container">
            <svg width={size} height={size} viewBox="0 0 32 32" className="widget-combobox-clear-button-icon">
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

export function DownArrow({ isOpen }: { isOpen?: boolean }): ReactElement {
    return (
        <span className="widget-combobox-icon-container">
            <svg
                className={classNames("widget-combobox-down-arrow-icon", "mx-icon-lined", "mx-icon-chevron-down", {
                    active: isOpen
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
    return (
        <Fragment>
            <span className="widget-combobox-icon-container">
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
            {ariaLabel ? <CaptionContent htmlFor={id}>{ariaLabel}</CaptionContent> : undefined}
        </Fragment>
    );
}
