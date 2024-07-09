/**
 * This file was generated from Markdown.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, EditableValue } from "mendix";

export type ReadOnlyStyleEnum = "bordered" | "text";

export interface MarkdownContainerProps {
    name: string;
    tabIndex?: number;
    id: string;
    stringAttribute: EditableValue<string>;
    spellcheck: boolean;
    showFooter: boolean;
    readOnlyStyle: ReadOnlyStyleEnum;
    onChangeEvent?: ActionValue;
    onEnterEvent?: ActionValue;
    onLeaveEvent?: ActionValue;
}

export interface MarkdownPreviewProps {
    readOnly: boolean;
    stringAttribute: string;
    spellcheck: boolean;
    showFooter: boolean;
    readOnlyStyle: ReadOnlyStyleEnum;
    onChangeEvent: {} | null;
    onEnterEvent: {} | null;
    onLeaveEvent: {} | null;
}
