import { createElement, ReactElement } from "react";

export function CloseIcon(): ReactElement {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                d="M14.205 3.205L12.795 1.795L8 6.585L3.205 1.795L1.795 3.205L6.585 8L1.795 12.795L3.205 14.205L8 9.415L12.795 14.205L14.205 12.795L9.415 8L14.205 3.205Z"
                fill="currentColor"
            />
        </svg>
    );
}
