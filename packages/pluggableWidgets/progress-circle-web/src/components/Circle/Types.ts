import React from "react";
import Shape from "./Shape";
import { TweenState } from "shifty";

export type ShapeRenderFunction = (state: TweenState, data: object | null) => void;
export interface TextOptions {
    style: React.CSSProperties;
    autoStyleContainer: boolean;
    alignToBottom: boolean;
    value: null | string | HTMLElement;
    className: string;
}

export interface SVGStyle {
    display: string;
    width: string;
}
export interface ShapeOptions {
    color?: string;
    strokeWidth?: number;
    trailColor?: string;
    trailWidth?: number;
    fill?: string;
    text?: TextOptions;
    svgStyle?: React.CSSProperties;
    warnings?: boolean;
    attachment?: object;
    shape?: Shape;
    delay?: number;
    duration?: number;
    easing?: string;
    from?: any;
    to?: any;
    offset?: number;
    render?: ShapeRenderFunction;
}
