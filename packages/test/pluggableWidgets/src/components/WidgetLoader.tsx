import React from "react";
import "../styles/WidgetLoader.scss";

interface WidgetLoaderProps {
    widgetName: string;
}

export const WidgetLoader: React.FC<WidgetLoaderProps> = ({ widgetName }) => (
    <div className="widget-loading">
        <div className="form-control">
            <div className="spinner"></div>
            Loading {widgetName}...
        </div>
    </div>
);
