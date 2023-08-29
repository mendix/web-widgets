import classNames from "classnames";
import { createElement, ReactElement, Fragment } from "react";

export function ClearButton({ size = "10" }): ReactElement {
    return (
        <span className="widget-combobox-icon-container">
            <svg
                className="widget-combobox-clear-button-icon"
                fill="currentColor"
                height={size}
                width={size}
                viewBox="0 0 329 329"
            >
                <path d="m194.800781 164.769531 128.210938-128.214843c8.34375-8.339844 8.34375-21.824219 0-30.164063-8.339844-8.339844-21.824219-8.339844-30.164063 0l-128.214844 128.214844-128.210937-128.214844c-8.34375-8.339844-21.824219-8.339844-30.164063 0-8.34375 8.339844-8.34375 21.824219 0 30.164063l128.210938 128.214843-128.210938 128.214844c-8.34375 8.339844-8.34375 21.824219 0 30.164063 4.15625 4.160156 9.621094 6.25 15.082032 6.25 5.460937 0 10.921875-2.089844 15.082031-6.25l128.210937-128.214844 128.214844 128.214844c4.160156 4.160156 9.621094 6.25 15.082032 6.25 5.460937 0 10.921874-2.089844 15.082031-6.25 8.34375-8.339844 8.34375-21.824219 0-30.164063zm0 0" />
            </svg>
        </span>
    );
}

export function DownArrow({ isOpen }: { isOpen?: boolean }): ReactElement {
    return (
        <span className="widget-combobox-icon-container">
            <svg
                className={classNames("widget-combobox-down-arrow-icon", {
                    active: isOpen
                })}
                fill="currentColor"
                height="20"
                width="20"
                viewBox="0 0 20 20"
            >
                <path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"></path>
            </svg>
        </span>
    );
}

export function Checkbox({ checked }: { checked: boolean | undefined }): ReactElement {
    return (
        <span className="widget-combobox-icon-container">
            <svg
                className={classNames("widget-combobox-down-checkbox-icon", {
                    checked
                })}
                width="24"
                height="20"
                viewBox="0 0 24 20"
            >
                {checked ? (
                    <Fragment>
                        <rect x="2" width="20" height="20" rx="5" />
                        <path d="M7 10.3077L10.6923 14L17.4615 6" />
                    </Fragment>
                ) : (
                    <rect x="2.5" y="0.5" width="19" height="19" rx="4.5" />
                )}
            </svg>
        </span>
    );
}
