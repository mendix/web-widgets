import { Component, ReactElement, cloneElement, createElement, isValidElement, PropsWithChildren } from "react";
import * as classNames from "classnames";

import { SidebarContent } from "./SidebarContent";
import { SidebarHeader } from "./SidebarHeader";
import "../ui/Sidebar.scss";

interface SidebarProps {
    className?: string;
    open: boolean;
    onClick?: () => void;
    onBlur?: () => void;
    onClose?: () => void;
}

export class Sidebar extends Component<PropsWithChildren<SidebarProps>, {}> {
    constructor(props: SidebarProps) {
        super(props);

        this.overlayClicked = this.overlayClicked.bind(this);
    }

    render() {
        return createElement(
            "div",
            {
                className: classNames("widget-sidebar", this.props.className, {
                    "widget-sidebar-open": this.props.open
                }),
                onClick: this.props.onClick
            },
            createElement("div", { className: "overlay", onClick: this.overlayClicked }),
            createElement(
                "div",
                { className: "sidebar-content" },
                this.getSidebarElement("HEADER"),
                this.getSidebarElement("CONTENT")
            )
        );
    }

    private getSidebarElement(type: "HEADER" | "CONTENT") {
        if (this.props.children) {
            if (Array.isArray(this.props.children)) {
                const element = this.props.children.find(
                    child =>
                        isValidElement(child) && child.type === (type === "HEADER" ? SidebarHeader : SidebarContent)
                );

                return type === "HEADER"
                    ? cloneElement(element as ReactElement<any>, { onClose: this.props.onClose })
                    : element;
            } else if (isValidElement(this.props.children)) {
                return this.props.children.type === (type === "HEADER" ? SidebarHeader : SidebarContent)
                    ? cloneElement(this.props.children as ReactElement<any>, { onClose: this.props.onClose })
                    : null;
            }
        }

        return null;
    }

    private overlayClicked() {
        if (this.props.open && this.props.onBlur) {
            this.props.onBlur();
        }
    }
}
