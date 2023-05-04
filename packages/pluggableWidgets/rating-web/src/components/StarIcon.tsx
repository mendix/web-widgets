import { createElement, ReactElement } from "react";

type StarIconProps = {
    className: string;
    empty: boolean | undefined;
    full: boolean | undefined;
};

export function StarIcon({ className, empty }: StarIconProps): ReactElement {
    return empty ? (
        <span className={className}>
            <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                <path d="M24.59,28.63l-8.54-3.87-8.63,3.86,.97-9.39L2.12,12.34l9.22-2.21L16,1.98l4.65,8.14,9.22,2.21-6.26,6.9,.97,9.4ZM5.88,13.49l4.59,5.06-.7,6.83,6.29-2.81,6.19,2.8-.7-6.82,4.59-5.06-6.78-1.62-3.35-5.86-3.35,5.86-6.78,1.62Z" />
            </svg>
        </span>
    ) : (
        <span className={className}>
            <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                <polygon points="29.88 12.34 20.65 10.13 16 1.98 11.35 10.13 2.12 12.34 8.38 19.23 7.42 28.62 16.04 24.76 24.59 28.63 23.62 19.23 29.88 12.34" />
            </svg>
        </span>
    );
}
