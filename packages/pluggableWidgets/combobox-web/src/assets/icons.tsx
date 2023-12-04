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
        <span style={{ display: "grid" }}>
            <svg
                width={16}
                height={16}
                viewBox="0 0 20 20"
                fill="currentColor"
                className="widget-combobox-unselect-all-button-icon"
            >
                <g>
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M1.95142 1.79123C2.09629 1.77861 2.24293 1.77217 2.39108 1.77217H13.2608C16.0222 1.77217 18.2608 4.01075 18.2608 6.77217V16.736C18.2608 17.22 18.192 17.688 18.0637 18.1307C19.2419 17.216 20 15.786 20 14.179V5C20 2.23858 17.7614 0 15 0H5.78613C4.24605 0 2.86861 0.696288 1.95142 1.79123Z"
                        fill="#24276c"
                    />
                    <rect y="2.64015" width="17.3914" height="17.3598" rx="5" fill="#24276c" />
                    <path
                        d="M12.0351 7.98986C11.8678 7.82369 11.6415 7.73042 11.4055 7.73042C11.1696 7.73042 10.9433 7.82369 10.7759 7.98986L8.72192 10.0419L6.67684 7.98986C6.50868 7.82186 6.2806 7.72748 6.04278 7.72748C5.80496 7.72748 5.57688 7.82186 5.40872 7.98986C5.24055 8.15786 5.14608 8.38571 5.14608 8.6233C5.14608 8.86089 5.24055 9.08874 5.40872 9.25674L7.46273 11.2998L5.40872 13.3429C5.31523 13.4229 5.2393 13.5213 5.1857 13.632C5.1321 13.7427 5.10197 13.8632 5.09722 13.9861C5.09247 14.109 5.1132 14.2315 5.15809 14.346C5.20299 14.4605 5.27109 14.5644 5.35813 14.6514C5.44516 14.7383 5.54924 14.8064 5.66384 14.8512C5.77844 14.8961 5.90108 14.9168 6.02407 14.912C6.14706 14.9073 6.26774 14.8772 6.37854 14.8236C6.48934 14.7701 6.58785 14.6942 6.66791 14.6008L8.72192 12.5578L10.767 14.6008C10.9378 14.747 11.1576 14.8234 11.3824 14.8147C11.6071 14.806 11.8203 14.713 11.9794 14.5541C12.1384 14.3952 12.2316 14.1822 12.2403 13.9576C12.249 13.7331 12.1725 13.5136 12.0262 13.3429L9.98112 11.2998L12.0262 9.25674C12.1105 9.17439 12.1776 9.07618 12.2237 8.96778C12.2698 8.85938 12.294 8.74294 12.2948 8.62516C12.2957 8.50738 12.2731 8.3906 12.2286 8.28157C12.184 8.17253 12.1183 8.07338 12.0351 7.98986Z"
                        fill="#ffffff"
                        stroke="white"
                        strokeWidth="0.2"
                    />
                </g>
            </svg>
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
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M1.95117 1.79126C2.09615 1.77862 2.2429 1.77217 2.39116 1.77217H13.2609C16.0223 1.77217 18.2609 4.01075 18.2609 6.77217V16.736C18.2609 17.2199 18.1921 17.6878 18.0639 18.1304C19.2418 17.2156 19.9998 15.7858 19.9998 14.179V5C19.9998 2.23858 17.7612 0 14.9998 0H5.78591C4.24582 0 2.86836 0.6963 1.95117 1.79126Z"
                    />
                    <rect y="2.64015" width="17.3914" height="17.3598" rx="5" />
                    <path
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
