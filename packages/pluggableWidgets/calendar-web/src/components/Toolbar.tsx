import { Button } from "@mendix/widget-plugin-component-kit/Button";
import { IconInternal } from "@mendix/widget-plugin-component-kit/IconInternal";
import classNames from "classnames";
import { createElement, ReactElement } from "react";
import { Navigate, ToolbarProps } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

export function CustomToolbar({ label, localizer, onNavigate, onView, view, views }: ToolbarProps): ReactElement {
    return (
        <div className="calendar-toolbar">
            <div className="align-left btn-group">
                <Button className="btn btn-default" onClick={() => onNavigate(Navigate.PREVIOUS)}>
                    <IconInternal icon={{ type: "glyph", iconClass: "glyphicon-backward" }} />
                </Button>
                <Button className="btn btn-default" onClick={() => onNavigate(Navigate.TODAY)}>
                    {localizer.messages.today}
                </Button>
                <Button className="btn btn-default" onClick={() => onNavigate(Navigate.NEXT)}>
                    <IconInternal icon={{ type: "glyph", iconClass: "glyphicon-forward" }} />
                </Button>
            </div>

            <div className="align-center btn-group">
                <span className="calendar-label">{label}</span>
            </div>

            <div className="align-right btn-group">
                {Array.isArray(views) &&
                    views.map(name => {
                        return (
                            <Button
                                key={name}
                                onClick={() => onView(name)}
                                className={classNames("btn", "btn-default", { active: view === name })}
                            >
                                {localizer.messages[name]}
                            </Button>
                        );
                    })}
            </div>
        </div>
    );
}
