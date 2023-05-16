import { ReactElement, createElement } from "react";

export default function ControlIcon({ direction }: { direction: string }): ReactElement {
    const classNames = `pagination-icon ${direction}`;
    switch (direction) {
        case "forward":
            return (
                <span aria-hidden>
                    <svg
                        className={classNames}
                        viewBox="0 0 32 32"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M17.81 6.63C17.48 6.37 17 6.61 17 7.02V24.98C17 25.4 17.48 25.63 17.81 25.37L28.5 16.39C28.76 16.19 28.76 15.8 28.5 15.6L17.81 6.63Z"
                            fill="currentColor"
                        />
                        <path
                            d="M4.81 6.63C4.48 6.37 4 6.61 4 7.02V24.98C4 25.4 4.48 25.63 4.81 25.37L15.5 16.39C15.76 16.19 15.76 15.8 15.5 15.6L4.81 6.63Z"
                            fill="currentColor"
                        />
                    </svg>
                </span>
            );
        case "step-forward":
            return (
                <span aria-hidden>
                    <svg
                        className={classNames}
                        viewBox="0 0 32 32"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M8.81 6.63C8.48 6.37 8 6.61 8 7.02V24.98C8 25.4 8.48 25.63 8.81 25.37L20.5 16.39C20.76 16.19 20.76 15.8 20.5 15.6L8.81 6.63Z"
                            fill="currentColor"
                        />
                        <path d="M24 6H22V26H24V6Z" fill="currentColor" />
                    </svg>
                </span>
            );
        case "backward":
            return (
                <span aria-hidden>
                    <svg
                        className={classNames}
                        viewBox="0 0 32 32"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M14.19 6.63L3.51 15.61C3.25 15.81 3.25 16.2 3.51 16.4L14.2 25.38C14.53 25.64 15.01 25.4 15.01 24.99V7.02C15.01 6.6 14.53 6.37 14.2 6.63H14.19Z"
                            fill="currentColor"
                        />
                        <path
                            d="M27.19 6.63L16.5 15.61C16.24 15.81 16.24 16.2 16.5 16.4L27.19 25.38C27.52 25.64 28 25.4 28 24.99V7.02C28 6.6 27.52 6.37 27.19 6.63Z"
                            fill="currentColor"
                        />
                    </svg>
                </span>
            );
        case "step-backward":
            return (
                <span aria-hidden>
                    <svg
                        className={classNames}
                        viewBox="0 0 32 32"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M23.19 6.63L11.51 15.61C11.25 15.81 11.25 16.2 11.51 16.4L23.2 25.38C23.53 25.64 24.01 25.4 24.01 24.99V7.02C24.01 6.6 23.53 6.37 23.2 6.63H23.19Z"
                            fill="currentColor"
                        />
                        <path d="M10 6H8V26H10V6Z" fill="currentColor" />
                    </svg>
                </span>
            );

        default:
            return <div></div>;
    }
}
