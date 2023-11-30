import classNames from "classnames";
import { createElement, ReactElement, MouseEvent } from "react";

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

export function SelectAll({ allSelected }: { allSelected?: boolean }): ReactElement {
    return (
        <span style={{ display: "flex" }}>
            <svg
                className={classNames("widget-combobox-select-all-button-icon", {
                    active: allSelected
                })}
                width={16}
                height={16}
                viewBox="0 0 20 20"
                fill="currentColor"
            >
                <g>
                    <path
                        className="select-all-icon-path-1"
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M1.95117 1.79126C2.09615 1.77862 2.2429 1.77217 2.39116 1.77217H13.2609C16.0223 1.77217 18.2609 4.01075 18.2609 6.77217V16.736C18.2609 17.2199 18.1921 17.6878 18.0639 18.1304C19.2418 17.2156 19.9998 15.7858 19.9998 14.179V5C19.9998 2.23858 17.7612 0 14.9998 0H5.78591C4.24582 0 2.86836 0.6963 1.95117 1.79126Z"
                    />
                    <rect y="2.64015" width="17.3914" height="17.3598" rx="5" />
                    <path
                        className="select-all-icon-path-2"
                        d="M5.35722 12.059L5.35721 12.059L5.3585 12.0603L7.18314 13.946C7.32365 14.1037 7.50412 14.1876 7.68981 14.1876C7.87563 14.1876 8.05622 14.1036 8.19677 13.9456L12.7145 9.194L12.7145 9.19401L12.7152 9.19329C13.0651 8.81787 12.9924 8.33284 12.7505 8.03543C12.6294 7.88648 12.4607 7.77713 12.2716 7.75305C12.079 7.72851 11.8785 7.79434 11.7041 7.97159L11.7041 7.97157L11.7026 7.97313L7.68957 12.2297L6.36954 10.8386L6.36955 10.8386L6.36828 10.8373C6.19386 10.66 5.99338 10.5942 5.80075 10.6187C5.61171 10.6428 5.44293 10.7522 5.32183 10.9011C5.08001 11.1985 5.00724 11.6836 5.35722 12.059Z"
                        fill="white"
                        stroke="white"
                        strokeWidth="0.2"
                    />
                </g>
            </svg>
        </span>
    );
}

export function Checkbox({ checked, id }: { checked: boolean | undefined; id?: string }): ReactElement {
    return (
        <span className="widget-combobox-icon-container">
            <input
                type="checkbox"
                tabIndex={-1}
                checked={checked}
                id={id}
                role="presentation"
                onClick={(e: MouseEvent<HTMLInputElement>) => {
                    e.preventDefault();
                }}
            />
        </span>
    );
}
