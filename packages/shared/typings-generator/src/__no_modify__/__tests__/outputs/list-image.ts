export const listImageWebOutput = `/**
 * This file was generated from MyWidget.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix UI Content Team
 */
import { DynamicValue, WebImage } from "mendix";

export interface ActionsType {
    image: DynamicValue<WebImage>;
}

export interface ActionsPreviewType {
    image: { type: "static"; imageUrl: string; } | { type: "dynamic"; entity: string; } | null;
}

export interface MyWidgetContainerProps {
    name: string;
    tabIndex?: number;
    id: string;
    actions: ActionsType[];
}

export interface MyWidgetPreviewProps {
    readOnly: boolean;
    actions: ActionsPreviewType[];
}
`;
export const listImageNativeOutput = `export interface ActionsType {
    image: DynamicValue<NativeImage>;
}

export interface MyWidgetProps<Style> {
    name: string;
    style: Style[];
    actions: ActionsType[];
}`;
