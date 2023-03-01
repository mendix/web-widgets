import { SFC, createElement } from "react";
import * as classNames from "classnames";

export const SidebarHeaderTools: SFC<{ className?: string }> = ({ className, children }) =>
    createElement("div", { className: classNames("sidebar-header-tools", className) }, children);
