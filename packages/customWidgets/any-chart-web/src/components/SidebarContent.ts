import { SFC, createElement } from "react";

export const SidebarContent: SFC<{ onClick?: () => void }> = ({ children, onClick }) =>
    createElement("div", { className: "sidebar-content-body", onClick }, children);

SidebarContent.displayName = "SidebarContent";
