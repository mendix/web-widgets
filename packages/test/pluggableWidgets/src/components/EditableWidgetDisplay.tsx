import React, { Suspense, useState, useCallback } from "react";
import type { WidgetInfo } from "../config/widgets";
import { WidgetLoader } from "./WidgetLoader";
import { JsonPropsEditor } from "./JsonPropsEditor";
import "../styles/WidgetDisplay.scss";

interface EditableWidgetDisplayProps {
    selectedWidget: WidgetInfo | null;
    enableJsonEditor?: boolean;
}

export const EditableWidgetDisplay: React.FC<EditableWidgetDisplayProps> = ({
    selectedWidget,
    enableJsonEditor = false
}) => {
    // State for editable props (only used when JSON editor is enabled)
    const [editableProps, setEditableProps] = useState<any>(null);
    // State to force re-renders when mock objects change
    const [, forceRender] = useState({});

    // Force re-render function
    const triggerRerender = useCallback(() => {
        forceRender({});
    }, []);

    // Initialize editable props when widget changes
    React.useEffect(() => {
        if (selectedWidget && enableJsonEditor) {
            setEditableProps(selectedWidget.props);
        }
    }, [selectedWidget, enableJsonEditor]);

    // Set up force re-render callback on mock objects
    React.useEffect(() => {
        if (selectedWidget) {
            const currentProps = enableJsonEditor && editableProps ? editableProps : selectedWidget.props;

            // Recursively set the re-render callback on all mock objects
            const setRerenderCallback = (obj: any) => {
                if (obj && typeof obj === "object") {
                    // Check if this object has a setValue function (indicating it's a mock)
                    if (typeof obj.setValue === "function") {
                        obj._triggerRerender = triggerRerender;
                    }

                    // Recursively check nested objects
                    Object.values(obj).forEach(value => {
                        if (value && typeof value === "object") {
                            setRerenderCallback(value);
                        }
                    });
                }
            };

            setRerenderCallback(currentProps);
        }
    }, [selectedWidget, editableProps, enableJsonEditor, triggerRerender]);

    const handlePropsChange = useCallback((newProps: any) => {
        setEditableProps(newProps);
    }, []);

    if (!selectedWidget) {
        return (
            <div className="widget-display">
                <div className="welcome-screen">
                    <div className="welcome-content">
                        <h2>Welcome to Widget Test Environment</h2>
                        <p>Select a widget from the menu on the left to begin testing.</p>
                    </div>
                </div>
            </div>
        );
    }

    // Use editable props if JSON editor is enabled, otherwise use default props
    const currentProps = enableJsonEditor && editableProps ? editableProps : selectedWidget.props;

    return (
        <div className="widget-display">
            <div className="widget-header">
                <h1>{selectedWidget.name}</h1>
                <p>{selectedWidget.description}</p>
                {enableJsonEditor && (
                    <div className="editor-badge">
                        <span className="badge-text">✏️ Interactive Props Editor</span>
                    </div>
                )}
            </div>

            {enableJsonEditor && (
                <JsonPropsEditor
                    initialProps={selectedWidget.props}
                    onPropsChange={handlePropsChange}
                    widgetName={selectedWidget.name}
                />
            )}

            <div className="widget-wrapper">
                <Suspense fallback={<WidgetLoader widgetName={selectedWidget.name} />}>
                    <selectedWidget.component {...currentProps} />
                </Suspense>
            </div>

            {enableJsonEditor && (
                <div className="widget-info">
                    <details className="widget-details">
                        <summary>Widget Information</summary>
                        <div className="widget-details-content">
                            <div className="info-section">
                                <h4>Current Props Structure</h4>
                                <p>The widget is currently using {editableProps ? "edited" : "default"} props.</p>
                                <p>Total properties: {Object.keys(currentProps).length}</p>
                            </div>
                            <div className="info-section">
                                <h4>How to Use</h4>
                                <ul>
                                    <li>Click the props editor header to expand/collapse the JSON editor</li>
                                    <li>Edit the JSON directly to see real-time changes in the widget</li>
                                    <li>Use the "Reset" button to restore default props</li>
                                    <li>The status indicator shows ✓ for valid JSON or ✗ for invalid JSON</li>
                                </ul>
                            </div>
                        </div>
                    </details>
                </div>
            )}
        </div>
    );
};
