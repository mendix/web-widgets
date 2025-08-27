import React, { Suspense } from "react";
import type { WidgetInfo } from "../config/widgets";
import { WidgetLoader } from "./WidgetLoader";
import "../styles/WidgetDisplay.scss";

interface WidgetDisplayProps {
    selectedWidget: WidgetInfo | null;
}

export const WidgetDisplay: React.FC<WidgetDisplayProps> = ({ selectedWidget }) => (
    <div className="widget-display">
        {selectedWidget ? (
            <div>
                <div className="widget-header">
                    <h1>{selectedWidget.name}</h1>
                    <p>{selectedWidget.description}</p>
                </div>

                <div className="widget-wrapper">
                    <Suspense fallback={<WidgetLoader widgetName={selectedWidget.name} />}>
                        <selectedWidget.component {...selectedWidget.props} />
                    </Suspense>
                </div>
            </div>
        ) : (
            <div className="welcome-screen">
                <div className="welcome-content">
                    <h2>Welcome to Widget Test Environment</h2>
                    <p>Select a widget from the menu on the left to begin testing.</p>
                </div>
            </div>
        )}
    </div>
);
