import { Component, createElement, PropsWithChildren } from "react";
import * as classNames from "classnames";

import "../ui/Panel.scss";

export interface PanelProps {
    heading?: string;
    className?: string;
    headingClass?: string;
}

export class Panel extends Component<PropsWithChildren<PanelProps>, {}> {
    render() {
        return createElement(
            "div",
            { className: classNames("widget-panel", this.props.className) },
            this.renderHeading(),
            this.props.children
        );
    }

    private renderHeading() {
        if (this.props.heading) {
            return createElement(
                "div",
                {
                    className: classNames("widget-panel-header", this.props.headingClass)
                },
                this.props.heading
            );
        }

        return null;
    }
}
