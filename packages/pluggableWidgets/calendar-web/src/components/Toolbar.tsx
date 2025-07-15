import { Button } from "@mendix/widget-plugin-component-kit/Button";
import { IconInternal } from "@mendix/widget-plugin-component-kit/IconInternal";
import classNames from "classnames";
import { createElement, ReactElement, useCallback } from "react";
import { Navigate, ToolbarProps, View } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

export function CustomToolbar({ label, localizer, onNavigate, onView, view, views }: ToolbarProps): ReactElement {
    const handlePrev = useCallback(() => onNavigate(Navigate.PREVIOUS), [onNavigate]);
    const handleToday = useCallback(() => onNavigate(Navigate.TODAY), [onNavigate]);
    const handleNext = useCallback(() => onNavigate(Navigate.NEXT), [onNavigate]);
    const handleView = useCallback((name: View) => onView(name), [onView]);

    return (
        <div className="calendar-toolbar">
            <div className="btn-group">
                <Button className="btn btn-default" onClick={handlePrev}>
                    <IconInternal icon={{ type: "glyph", iconClass: "glyphicon-backward" }} />
                </Button>
                <Button className="btn btn-default" onClick={handleToday}>
                    {localizer.messages.today}
                </Button>
                <Button className="btn btn-default" onClick={handleNext}>
                    <IconInternal icon={{ type: "glyph", iconClass: "glyphicon-forward" }} />
                </Button>
            </div>

            <div className="btn-group">
                <span className="calendar-label">{label}</span>
            </div>

            <div className="btn-group">
                {Array.isArray(views) &&
                    views.map(name => {
                        return (
                            <Button
                                key={name}
                                onClick={() => handleView(name)}
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
