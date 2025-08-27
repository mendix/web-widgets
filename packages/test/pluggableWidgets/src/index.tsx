import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { widgets, type WidgetType, type WidgetInfo } from "./config/widgets";
import { WidgetMenu, EditableWidgetDisplay } from "./components";

// Import Atlas-based styling
import "./styles/theme.compiled.css";
import "./styles/main-layout.scss";

const App: React.FC = () => {
    const [selectedWidgetId, setSelectedWidgetId] = useState<WidgetType | null>(null);

    const selectedWidget = selectedWidgetId ? widgets.find(w => w.id === selectedWidgetId) || null : null;

    return (
        <div className="app-container">
            <WidgetMenu widgets={widgets} selectedWidget={selectedWidgetId} onSelectWidget={setSelectedWidgetId} />
            <EditableWidgetDisplay
                selectedWidget={selectedWidget}
                enableJsonEditor={selectedWidget?.enableJsonEditor || false}
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
