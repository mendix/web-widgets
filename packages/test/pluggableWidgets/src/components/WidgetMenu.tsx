import React from "react";
import type { WidgetInfo, WidgetType } from "../config/widgets";
import "../styles/WidgetMenu.scss";

interface WidgetMenuProps {
    widgets: WidgetInfo[];
    selectedWidget: WidgetType | null;
    onSelectWidget: (widgetId: WidgetType) => void;
}

export const WidgetMenu: React.FC<WidgetMenuProps> = ({ widgets, selectedWidget, onSelectWidget }) => (
    <div className="widget-menu">
        <h3>Widget Test Environment</h3>

        <nav>
            <ul>
                {widgets.map(widget => (
                    <li key={widget.id}>
                        <button
                            className={selectedWidget === widget.id ? "selected" : ""}
                            onClick={() => onSelectWidget(widget.id)}
                        >
                            {widget.name}
                        </button>
                    </li>
                ))}
            </ul>
        </nav>

        <div className="instructions">
            <strong>Instructions:</strong>
            <br />
            Select a widget from the menu to view and test its functionality.
        </div>
    </div>
);
