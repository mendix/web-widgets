/**
 * This file was generated from DocumentViewer.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, DynamicValue, FileValue } from "mendix";

export interface DocumentViewerContainerProps {
    name: string;
    tabIndex?: number;
    id: string;
    file: DynamicValue<FileValue>;
    onChangeEvent?: ActionValue;
    onEnterEvent?: ActionValue;
    onLeaveEvent?: ActionValue;
}

export interface DocumentViewerPreviewProps {
    readOnly: boolean;
    file: string;
    onChangeEvent: {} | null;
    onEnterEvent: {} | null;
    onLeaveEvent: {} | null;
}
