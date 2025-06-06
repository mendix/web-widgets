import { createElement, ReactElement, PropsWithChildren, ButtonHTMLAttributes } from "react";

type ButtonProps = PropsWithChildren & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ children, type = "button", ...buttonProps }: ButtonProps): ReactElement {
    return (
        <button type={type} {...buttonProps}>
            {children}
        </button>
    );
}
