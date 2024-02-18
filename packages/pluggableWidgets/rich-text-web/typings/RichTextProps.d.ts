/**
 * This file was generated from RichText.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { EditableValue } from "mendix";

export interface RichTextContainerProps {
    name: string;
    tabIndex?: number;
    id: string;
    stringAttribute: EditableValue<string>;
    plugins: string;
    toolbar: string;
    enableMenuBar: boolean;
    menubar: string;
    editorHeight: number;
}

export interface RichTextPreviewProps {
    readOnly: boolean;
    stringAttribute: string;
    plugins: string;
    toolbar: string;
    enableMenuBar: boolean;
    menubar: string;
    editorHeight: number | null;
}
