import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { widgets, type WidgetType, type WidgetInfo, type WidgetVariant } from "./config/widgets";
import { WidgetMenu, EditableWidgetDisplay, type WidgetSelection } from "./components";

// Import Atlas-based styling
import "./styles/theme.compiled.css";
import "./styles/main-layout.scss";

const App: React.FC = () => {
    const [selectedWidgetSelection, setSelectedWidgetSelection] = useState<WidgetSelection | null>(null);

    // Helper function to get the actual widget and variant info
    const getSelectedWidgetInfo = (
        selection: WidgetSelection | null
    ): { widget: WidgetInfo | null; variant: WidgetVariant | null } => {
        if (!selection) return { widget: null, variant: null };

        const widget = widgets.find(w => w.id === selection.widgetId) || null;
        if (!widget) return { widget: null, variant: null };

        if (selection.variantId && widget.variants) {
            const variant = widget.variants.find(v => v.id === selection.variantId) || null;
            return { widget, variant };
        }

        return { widget, variant: null };
    };

    const { widget: selectedWidget, variant: selectedVariant } = getSelectedWidgetInfo(selectedWidgetSelection);

    return (
        <div className="app-container">
            <WidgetMenu
                widgets={widgets}
                selectedWidget={selectedWidgetSelection}
                onSelectWidget={setSelectedWidgetSelection}
            />
            <EditableWidgetDisplay
                key={
                    selectedWidgetSelection
                        ? `${selectedWidgetSelection.widgetId}-${selectedWidgetSelection.variantId || "default"}`
                        : "no-widget"
                }
                selectedWidget={selectedWidget}
                selectedVariant={selectedVariant}
            />
        </div>
    );
};

const container = document.getElementById("root");
if (container) {
    const root = createRoot(container);
    root.render(<App />);
} else {
    console.error("Root container not found");
}
