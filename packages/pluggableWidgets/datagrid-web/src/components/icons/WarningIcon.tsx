import { createElement, ReactElement } from "react";

export function WarningIcon(): ReactElement {
    return (
        <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <rect x="13.3773" y="10.5415" width="5.30402" height="14.7575" fill="white" />
            <path
                d="M29.71 24.97L23.77 15.11L17.64 4.94C16.89 3.69 15.11 3.69 14.36 4.94L8.23002 15.11L2.29002 24.97C1.50002 26.29 2.42002 28 3.94002 28H28.06C29.58 28 30.5 26.29 29.71 24.97ZM16 25C14.9 25 14 24.1 14 23C14 22 14.74 21.18 15.7 21.03C15.8 21.01 15.9 21 16 21C16.1 21 16.21 21.01 16.3 21.03C17.26 21.18 18 22 18 23C18 24.1 17.1 25 16 25ZM18 19H14V11H18V19Z"
                fill="currentColor"
            />
        </svg>
    );
}
