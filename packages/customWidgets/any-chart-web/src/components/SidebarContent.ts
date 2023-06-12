import { FunctionComponent, createElement, PropsWithChildren } from "react";

export const SidebarContent: FunctionComponent<PropsWithChildren<{ onClick?: () => void }>> = ({ children, onClick }) =>
    createElement("div", { className: "sidebar-content-body", onClick }, children);

SidebarContent.displayName = "SidebarContent";
