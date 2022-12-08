interface BaseStylingProps {
    grow?: number;
}

interface BlockStylingProps extends BaseStylingProps {
    borders?: boolean;
    borderRadius?: number;
    borderWidth?: number;
    backgroundColor?: string;
    padding?: number;
}

interface TextStylingProps extends BaseStylingProps {
    fontSize?: number;
    fontColor?: string;
    bold?: boolean;
    italic?: boolean;
}

export interface ImageProps extends BaseStylingProps {
    type: "Image";
    document?: string; // svg image
    data?: string; // base64 image. Will only be read if no svg image is passed
    width?: number; // sets a fixed maximum width
    height?: number; // sets a fixed maximum height
}

export function svgImage(svgTextData: string, width?: number, height?: number): ImageProps {
    return {
        type: "Image",
        document: svgTextData,
        width,
        height
    };
}

export function image(base64Data: string, width?: number, height?: number): ImageProps {
    return {
        type: "Image",
        data: base64Data,
        width,
        height
    };
}

export interface ContainerProps extends BlockStylingProps {
    type: "Container";
    children?: StructurePreviewProps[];
}

export function container(styleProps?: BlockStylingProps): (...children: StructurePreviewProps[]) => ContainerProps {
    return (...children: StructurePreviewProps[]) => {
        return {
            type: "Container",
            ...styleProps,
            children
        };
    };
}

export interface RowLayoutStyling extends BlockStylingProps {
    columnSize?: "fixed" | "grow";
}

export interface RowLayoutProps extends RowLayoutStyling {
    type: "RowLayout";
    children: StructurePreviewProps[];
}

export function rowLayout(styleProps?: RowLayoutStyling): (...children: StructurePreviewProps[]) => RowLayoutProps {
    return (...children: StructurePreviewProps[]) => {
        return {
            type: "RowLayout",
            ...styleProps,
            children
        };
    };
}

export interface TextProps extends TextStylingProps {
    type: "Text";
    content: string;
}

export function text(style?: TextStylingProps): (content: string) => TextProps {
    return (content: string) => {
        return {
            type: "Text",
            ...style,
            content
        };
    };
}

export interface DropZoneStylingProps extends BaseStylingProps {
    placeholder?: string;
    showDataSourceHeader?: boolean;
}
export interface DropZoneProps extends DropZoneStylingProps {
    type: "DropZone";
    property: object;
}

export function dropzone(...options: Array<Partial<DropZoneStylingProps>>): (prop: object) => DropZoneProps {
    const params = Object.assign({}, ...options) as Partial<DropZoneStylingProps>;

    return (property: object) => ({
        type: "DropZone",
        property,
        ...params
    });
}

dropzone.placeholder = (placeholder: string) => {
    return {
        placeholder
    };
};
dropzone.hideDataSourceHeaderIf = (hideCondition: boolean) => {
    return hideCondition ? { showDataSourceHeader: false } : {};
};

export interface SelectableProps extends BaseStylingProps {
    type: "Selectable";
    object: object;
    child: StructurePreviewProps;
}

export function selectable(
    object: object,
    style?: BaseStylingProps
): (child: StructurePreviewProps) => SelectableProps {
    return (child: StructurePreviewProps) => {
        return {
            type: "Selectable",
            object,
            child,
            ...style
        };
    };
}

export interface DatasourceProps extends BaseStylingProps {
    type: "Datasource";
    property: object | null; // datasource property object from Values API
    child?: StructurePreviewProps; // any type of preview property component (optional)
}

export function datasource(property: object | null): (child?: StructurePreviewProps) => DatasourceProps {
    return (child: StructurePreviewProps) => {
        return {
            type: "Datasource",
            property,
            child
        };
    };
}

export type StructurePreviewProps =
    | ImageProps
    | ContainerProps
    | RowLayoutProps
    | TextProps
    | DropZoneProps
    | SelectableProps
    | DatasourceProps;
