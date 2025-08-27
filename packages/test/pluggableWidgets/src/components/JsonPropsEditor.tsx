import React, { useState, useCallback, useEffect } from "react";
import { deepRestoreFunctions } from "../mocks/mock-restoration";
import "../styles/JsonPropsEditor.scss";

interface JsonPropsEditorProps {
    initialProps: any;
    onPropsChange: (newProps: any) => void;
    widgetName: string;
}

export const JsonPropsEditor: React.FC<JsonPropsEditorProps> = ({ initialProps, onPropsChange, widgetName }) => {
    const [jsonText, setJsonText] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isValid, setIsValid] = useState(true);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Initialize JSON text from props
    useEffect(() => {
        try {
            const formattedJson = JSON.stringify(initialProps, null, 2);
            setJsonText(formattedJson);
            setError(null);
            setIsValid(true);
            setHasUnsavedChanges(false);
        } catch (err) {
            setError("Failed to serialize initial props");
            setIsValid(false);
        }
    }, [initialProps]);

    const handleJsonChange = useCallback((newJsonText: string) => {
        setJsonText(newJsonText);
        setHasUnsavedChanges(true);

        try {
            JSON.parse(newJsonText); // Just validate, don't apply changes yet
            setError(null);
            setIsValid(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Invalid JSON");
            setIsValid(false);
        }
    }, []);

    const handleSave = useCallback(() => {
        if (!isValid) {
            return;
        }

        try {
            const parsedProps = JSON.parse(jsonText);

            // Restore function references that were lost during JSON serialization
            const restoredProps = deepRestoreFunctions(parsedProps);

            onPropsChange(restoredProps);
            setHasUnsavedChanges(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Invalid JSON");
            setIsValid(false);
        }
    }, [jsonText, isValid, onPropsChange]);

    const handleReset = useCallback(() => {
        try {
            const resetJson = JSON.stringify(initialProps, null, 2);
            setJsonText(resetJson);
            setError(null);
            setIsValid(true);
            setHasUnsavedChanges(false);
            // Reset to original props (which already have proper function references)
            onPropsChange(initialProps);
        } catch (err) {
            setError("Failed to reset props");
        }
    }, [initialProps, onPropsChange]);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="json-props-editor">
            <div className="editor-header">
                <button className="toggle-button" onClick={toggleExpanded} aria-expanded={isExpanded}>
                    <span className={`toggle-icon ${isExpanded ? "expanded" : ""}`}>▶</span>
                    <span className="editor-title">{widgetName} Props Editor</span>
                    <span
                        className={`status-indicator ${isValid ? (hasUnsavedChanges ? "unsaved" : "valid") : "invalid"}`}
                    >
                        {!isValid ? "✗" : hasUnsavedChanges ? "●" : "✓"}
                    </span>
                </button>

                {isExpanded && (
                    <div className="editor-buttons">
                        <button
                            className="save-button"
                            onClick={handleSave}
                            disabled={!isValid || !hasUnsavedChanges}
                            title="Save changes and apply to widget"
                        >
                            Save
                        </button>
                        <button className="reset-button" onClick={handleReset} title="Reset to default props">
                            Reset
                        </button>
                    </div>
                )}
            </div>

            {isExpanded && (
                <div className="editor-content">
                    <div className="editor-controls">
                        <label htmlFor="json-textarea" className="sr-only">
                            Edit {widgetName} props as JSON
                        </label>
                        {error && (
                            <div className="error-message" role="alert">
                                <strong>JSON Error:</strong> {error}
                            </div>
                        )}
                    </div>

                    <textarea
                        id="json-textarea"
                        className={`json-textarea ${isValid ? "valid" : "invalid"}`}
                        value={jsonText}
                        onChange={e => handleJsonChange(e.target.value)}
                        placeholder="Enter valid JSON props..."
                        rows={20}
                        spellCheck={false}
                    />

                    <div className="editor-footer">
                        <div className="editor-info">
                            <span className="lines-count">Lines: {jsonText.split("\n").length}</span>
                            <span className="chars-count">Characters: {jsonText.length}</span>
                            {hasUnsavedChanges && <span className="unsaved-indicator">Unsaved changes</span>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
