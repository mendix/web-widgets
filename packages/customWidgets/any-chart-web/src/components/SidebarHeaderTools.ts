import { FunctionComponent, createElement, PropsWithChildren } from "react";
import * as classNames from "classnames";

export const SidebarHeaderTools: FunctionComponent<PropsWithChildren<{ className?: string }>> = ({
    className,
    children
}) => createElement("div", { className: classNames("sidebar-header-tools", className) }, children);
