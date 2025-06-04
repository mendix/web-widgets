import { createElement, ReactElement } from "react";
import { Navigate, ToolbarProps } from "react-big-calendar";
import { Button } from "./Button";
import "react-big-calendar/lib/css/react-big-calendar.css";

export function CustomToolbar({ label, localizer, onNavigate, onView, view, views }: ToolbarProps): ReactElement {
    return (
        <div className="calendar-toolbar">
            <div className="align-left btn-group">
                <Button onClick={() => onNavigate(Navigate.PREVIOUS)}>
                    <span className="glyphicon glyphicon-backward" />
                </Button>
                <Button onClick={() => onNavigate(Navigate.TODAY)}>{localizer.messages.today}</Button>
                <Button onClick={() => onNavigate(Navigate.NEXT)}>
                    <span className="glyphicon glyphicon-forward" />
                </Button>
            </div>

            <div className="align-center btn-group">
                <span className="calendar-label">{label}</span>
            </div>

            <div className="align-right btn-group">
                {Array.isArray(views) &&
                    views.map(name => {
                        return (
                            <Button key={name} onClick={() => onView(name)} isActive={view === name}>
                                {localizer.messages[name]}
                            </Button>
                        );
                    })}
            </div>
        </div>
    );
}
