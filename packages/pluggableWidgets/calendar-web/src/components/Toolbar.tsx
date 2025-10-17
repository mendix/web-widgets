import { Button } from "@mendix/widget-plugin-component-kit/Button";
import { IconInternal } from "@mendix/widget-plugin-component-kit/IconInternal";
import classNames from "classnames";
import { ReactElement, useCallback } from "react";
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

export type ResolvedToolbarItem = {
    itemType: "previous" | "today" | "next" | "title" | "month" | "week" | "work_week" | "day" | "agenda";
    position: "left" | "center" | "right";
    caption?: string;
    tooltip?: string;
    renderMode: "button" | "link";
};

export function createConfigurableToolbar(items: ResolvedToolbarItem[]): (props: ToolbarProps) => ReactElement {
    return function ConfigurableToolbar({ label, localizer, onNavigate, onView, view }: ToolbarProps) {
        const renderButton = (
            key: string,
            content: ReactElement | string,
            onClick: () => void,
            active = false,
            renderMode: "button" | "link" = "button",
            tooltip?: string
        ): ReactElement => (
            <Button
                key={key}
                className={classNames("btn", renderMode === "link" ? "btn-link" : "btn-default", { active })}
                onClick={onClick}
                title={tooltip}
            >
                {content}
            </Button>
        );

        const groups: Record<"left" | "center" | "right", ResolvedToolbarItem[]> = {
            left: [],
            center: [],
            right: []
        };
        items.forEach(item => {
            groups[item.position].push(item);
        });

        const renderItem = (item: ResolvedToolbarItem): ReactElement | null => {
            switch (item.itemType) {
                case "previous":
                    return renderButton(
                        "prev",
                        <IconInternal icon={{ type: "glyph", iconClass: "glyphicon-backward" }} />,
                        () => onNavigate(Navigate.PREVIOUS),
                        false,
                        item.renderMode,
                        item.tooltip
                    );
                case "today":
                    // Always provide a default caption for 'today' button
                    return renderButton(
                        "today",
                        (item.caption || localizer.messages.today) as unknown as ReactElement,
                        () => onNavigate(Navigate.TODAY),
                        false,
                        item.renderMode,
                        item.tooltip
                    );
                case "next":
                    return renderButton(
                        "next",
                        <IconInternal icon={{ type: "glyph", iconClass: "glyphicon-forward" }} />,
                        () => onNavigate(Navigate.NEXT),
                        false,
                        item.renderMode,
                        item.tooltip
                    );
                case "title":
                    // Title always shows the formatted label, regardless of caption
                    return (
                        <span key="title" className="calendar-label" title={item.tooltip}>
                            {label}
                        </span>
                    );
                case "month":
                case "week":
                case "work_week":
                case "day":
                case "agenda": {
                    const name = item.itemType as View;
                    // Provide default caption from localizer messages if not specified
                    const caption = item.caption || localizer.messages[name];
                    return renderButton(
                        name,
                        caption as unknown as ReactElement,
                        () => onView(name),
                        view === name,
                        item.renderMode,
                        item.tooltip
                    );
                }
                default:
                    return null;
            }
        };

        return (
            <div className="calendar-toolbar">
                <div className="btn-group">{groups.left.map(renderItem)}</div>
                <div className="btn-group">{groups.center.map(renderItem)}</div>
                <div className="btn-group">{groups.right.map(renderItem)}</div>
            </div>
        );
    };
}
