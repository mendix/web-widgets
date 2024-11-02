/**
 * This file was generated from Markdown.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { EditableValue } from "mendix";

export interface MarkdownContainerProps {
    name: string;
    tabIndex?: number;
    id: string;
    stringAttribute: EditableValue<string>;
}

export interface MarkdownPreviewProps {
    readOnly: boolean;
    renderMode?: "design" | "xray" | "structure";
    stringAttribute: string;
}
