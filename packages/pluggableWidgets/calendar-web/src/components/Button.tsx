import classNames from "classnames";
import { createElement, ReactElement, PropsWithChildren } from "react";

type ButtonProps = PropsWithChildren & { isActive?: boolean; onClick?: () => void };

export function Button({ children, isActive = false, onClick }: ButtonProps): ReactElement {
    return (
        <button className={classNames("btn", "btn-default", { active: isActive })} onClick={onClick}>
            {children}
        </button>
    );
}
