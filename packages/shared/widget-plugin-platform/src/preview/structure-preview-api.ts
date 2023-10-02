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
    data?: string; // base64 image
    property?: object; // widget image property object from Values API
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

const alphaHexByPercent = new Map([
    [100, "FF"],
    [99, "FC"],
    [98, "FA"],
    [97, "F7"],
    [96, "F5"],
    [95, "F2"],
    [94, "F0"],
    [93, "ED"],
    [92, "EB"],
    [91, "E8"],
    [90, "E6"],
    [89, "E3"],
    [88, "E0"],
    [87, "DE"],
    [86, "DB"],
    [85, "D9"],
    [84, "D6"],
    [83, "D4"],
    [82, "D1"],
    [81, "CF"],
    [80, "CC"],
    [79, "C9"],
    [78, "C7"],
    [77, "C4"],
    [76, "C2"],
    [75, "BF"],
    [74, "BD"],
    [73, "BA"],
    [72, "B8"],
    [71, "B5"],
    [70, "B3"],
    [69, "B0"],
    [68, "AD"],
    [67, "AB"],
    [66, "A8"],
    [65, "A6"],
    [64, "A3"],
    [63, "A1"],
    [62, "9E"],
    [61, "9C"],
    [60, "99"],
    [59, "96"],
    [58, "94"],
    [57, "91"],
    [56, "8F"],
    [55, "8C"],
    [54, "8A"],
    [53, "87"],
    [52, "85"],
    [51, "82"],
    [50, "80"],
    [49, "7D"],
    [48, "7A"],
    [47, "78"],
    [46, "75"],
    [45, "73"],
    [44, "70"],
    [43, "6E"],
    [42, "6B"],
    [41, "69"],
    [40, "66"],
    [39, "63"],
    [38, "61"],
    [37, "5E"],
    [36, "5C"],
    [35, "59"],
    [34, "57"],
    [33, "54"],
    [32, "52"],
    [31, "4F"],
    [30, "4D"],
    [29, "4A"],
    [28, "47"],
    [27, "45"],
    [26, "42"],
    [25, "40"],
    [24, "3D"],
    [23, "3B"],
    [22, "38"],
    [21, "36"],
    [20, "33"],
    [19, "30"],
    [18, "2E"],
    [17, "2B"],
    [16, "29"],
    [15, "26"],
    [14, "24"],
    [13, "21"],
    [12, "1F"],
    [11, "1C"],
    [10, "1A"],
    [9, "17"],
    [8, "14"],
    [7, "12"],
    [6, "0F"],
    [5, "0D"],
    [4, "0A"],
    [3, "08"],
    [2, "05"],
    [1, "03"],
    [0, "00"]
]);

// Example: colorWithAlpha('#FF0000', 20);
export function colorWithAlpha(color: string, alpha: number): string {
    const xAlpha = alphaHexByPercent.get(alpha);
    if (!xAlpha) {
        throw Error(`Structure preview error: Can't convert alpha value (${alpha}) to hex`);
    }
    return `#${xAlpha}${color.slice(1)}`;
}

const paletteDark = {
    text: {
        primary: "#DEDEDE",
        secondary: "#A4A4A4",
        data: "#579BF9"
    },
    background: {
        topbarData: colorWithAlpha("#3A65E5", 20),
        topbarStandard: colorWithAlpha("#646464", 20),
        buttonInfo: "#579BF9",
        container: "#313131",
        containerDisabled: "#4F4F4F"
    }
} as const;

const paletteLight = {
    text: {
        primary: "#2F3646",
        secondary: "#6B707B",
        data: "#146FF4"
    },
    background: {
        topbarData: "#DCEEFE",
        topbarStandard: "#F7F7F7",
        buttonInfo: "#146FF4",
        container: "#FFFFFF",
        containerDisabled: "#C8C8C8"
    }
} as const;

export const structurePreviewPalette = Object.freeze({
    dark: paletteDark,
    light: paletteLight
});

export type StructurePreviewProps =
    | ImageProps
    | ContainerProps
    | RowLayoutProps
    | TextProps
    | DropZoneProps
    | SelectableProps
    | DatasourceProps;
