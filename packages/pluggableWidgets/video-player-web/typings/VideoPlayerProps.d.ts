/**
 * This file was generated from VideoPlayer.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { DynamicValue } from "mendix";

export type TypeEnum = "dynamic" | "expression";

export type WidthUnitEnum = "percentage" | "pixels";

export type HeightUnitEnum = "aspectRatio" | "percentageOfParent" | "percentageOfWidth" | "pixels";

export type HeightAspectRatioEnum = "sixteenByNine" | "fourByThree" | "threeByTwo" | "TwentyOneByNine" | "oneByOne";

export interface VideoPlayerContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    type: TypeEnum;
    urlExpression?: DynamicValue<string>;
    posterExpression?: DynamicValue<string>;
    videoUrl?: DynamicValue<string>;
    posterUrl?: DynamicValue<string>;
    autoStart: boolean;
    showControls: boolean;
    muted: boolean;
    loop: boolean;
    widthUnit: WidthUnitEnum;
    width: number;
    heightUnit: HeightUnitEnum;
    heightAspectRatio: HeightAspectRatioEnum;
    height: number;
}

export interface VideoPlayerPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode?: "design" | "xray" | "structure";
    type: TypeEnum;
    urlExpression: string;
    posterExpression: string;
    videoUrl: string;
    posterUrl: string;
    autoStart: boolean;
    showControls: boolean;
    muted: boolean;
    loop: boolean;
    widthUnit: WidthUnitEnum;
    width: number | null;
    heightUnit: HeightUnitEnum;
    heightAspectRatio: HeightAspectRatioEnum;
    height: number | null;
}
