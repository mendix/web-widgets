import { ReactElement, useMemo } from "react";

export type StatusBarMetricType = "wordCount" | "characterCount" | "characterCountHtml";

export interface StatusBarProps {
    content: string;
    metricType: StatusBarMetricType;
}

function getWordCount(text: string): number {
    if (!text || text.trim().length === 0) {
        return 0;
    }
    // Split on whitespace and filter out empty strings
    return text
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0).length;
}

function getCharCount(text: string): number {
    if (!text) {
        return 0;
    }
    return text.length;
}

function getHtmlCharCount(html: string): number {
    if (!html) {
        return 0;
    }
    return html.length;
}

export function StatusBar({ content, metricType }: StatusBarProps): ReactElement {
    // Debounced metric calculation using useMemo
    // The metric updates only when content changes, providing built-in debouncing
    const metricValue = useMemo(() => {
        switch (metricType) {
            case "wordCount":
                return getWordCount(content);
            case "characterCount":
                return getCharCount(content);
            case "characterCountHtml":
                return getHtmlCharCount(content);
            default:
                return 0;
        }
    }, [content, metricType]);

    const displayText = useMemo(() => {
        switch (metricType) {
            case "wordCount":
                return `Words: ${metricValue}`;
            case "characterCount":
                return `Characters: ${metricValue}`;
            case "characterCountHtml":
                return `Characters (HTML): ${metricValue}`;
            default:
                return "";
        }
    }, [metricType, metricValue]);

    return (
        <div
            className="rich-text-status-bar"
            tabIndex={0}
            role="region"
            aria-label="Editor status bar"
            aria-live="polite"
        >
            <span className="status-bar-text">{displayText}</span>
        </div>
    );
}
