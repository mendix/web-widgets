import { Component, createElement, PropsWithChildren } from "react";
import * as classNames from "classnames";
import { IconButton } from "./IconButton";

interface SidebarHeaderProps {
    onClick?: () => void;
    className?: string;
    onClose?: () => void;
}

export class SidebarHeader extends Component<PropsWithChildren<SidebarHeaderProps>, {}> {
    private contentSize = 10;

    render() {
        return createElement(
            "div",
            { className: classNames("sidebar-content-header", this.props.className) },
            this.renderHeaderContent(),
            this.renderCloser()
        );
    }

    private renderHeaderContent() {
        this.contentSize = this.props.onClose ? this.contentSize : 12;

        return createElement(
            "div",
            {
                className: `header-content col-sm-${this.contentSize} col-xs-${this.contentSize}`
            },
            this.props.children
        );
    }

    private renderCloser() {
        if (this.props.onClose) {
            return createElement(
                "div",
                { className: "col-sm-2 col-xs-2" },
                createElement(IconButton, {
                    className: "pull-right remove",
                    glyphIcon: "remove",
                    onClick: this.props.onClose
                })
            );
        }

        return null;
    }
}
