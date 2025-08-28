import React from "react";
import type { WidgetInfo, WidgetType, WidgetVariant } from "../config/widgets";
import "../styles/WidgetMenu.scss";

// New type for variant selection
export type WidgetSelection = {
    widgetId: WidgetType;
    variantId?: string;
};

interface WidgetMenuProps {
    widgets: WidgetInfo[];
    selectedWidget: WidgetSelection | null;
    onSelectWidget: (selection: WidgetSelection) => void;
}

export const WidgetMenu: React.FC<WidgetMenuProps> = ({ widgets, selectedWidget, onSelectWidget }) => {
    const isSelected = (widgetId: WidgetType, variantId?: string) => {
        if (!selectedWidget) return false;
        return selectedWidget.widgetId === widgetId && selectedWidget.variantId === variantId;
    };

    return (
        <div className="widget-menu">
            <h3>Widget Test Environment</h3>

            <nav>
                <ul>
                    {widgets.map(widget => {
                        // If widget has variants, show them as sub-items
                        if (widget.variants && widget.variants.length > 0) {
                            return (
                                <li key={widget.id} className="widget-group">
                                    <div className="widget-group-header">
                                        <span className="widget-name">{widget.name}</span>
                                    </div>
                                    <ul className="variant-list">
                                        {widget.variants.map(variant => (
                                            <li key={variant.id} className="variant-item">
                                                <button
                                                    className={isSelected(widget.id, variant.id) ? "selected" : ""}
                                                    onClick={() =>
                                                        onSelectWidget({
                                                            widgetId: widget.id,
                                                            variantId: variant.id
                                                        })
                                                    }
                                                    title={variant.description}
                                                >
                                                    <span className="variant-name">{variant.name}</span>
                                                    {variant.enableJsonEditor && (
                                                        <span
                                                            className="editor-indicator"
                                                            title="Interactive props editor available"
                                                        >
                                                            ✏️
                                                        </span>
                                                    )}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            );
                        } else {
                            // Legacy single-variant widget
                            return (
                                <li key={widget.id}>
                                    <button
                                        className={isSelected(widget.id) ? "selected" : ""}
                                        onClick={() => onSelectWidget({ widgetId: widget.id })}
                                    >
                                        <span className="widget-name">{widget.name}</span>
                                        {widget.enableJsonEditor && (
                                            <span
                                                className="editor-indicator"
                                                title="Interactive props editor available"
                                            >
                                                ✏️
                                            </span>
                                        )}
                                    </button>
                                </li>
                            );
                        }
                    })}
                </ul>
            </nav>

            <div className="instructions">
                <strong>Instructions:</strong>
                <br />
                Select a widget or variant from the menu to view and test its functionality.
            </div>
        </div>
    );
};
