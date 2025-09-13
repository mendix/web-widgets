import { Dimensions } from "@mendix/widget-plugin-platform/utils/get-dimensions";
import { CSSProperties } from "react";
import { GeoJSONFeaturesType, DrawingToolsEnum } from "./MapsProps";
import { ActionValue, EditableValue } from "mendix";
export interface ModeledMarker {
    address?: string;
    latitude?: number;
    longitude?: number;
    title?: string;
    customMarker?: string;
    action?: () => void;
    id?: string;
}

export interface Marker {
    latitude: number;
    longitude: number;
    url: string;
    onClick?: () => void;
    title?: string;
    id?: string;
}

export interface ModeledGeoJSONFeature {
    geoJSON: string; // Mendix attribute for GeoJSON string
    color?: string; // Optional styling properties
    stroke?: boolean;
    weight?: number;
    opacity?: number;
    fill?: boolean;
    fillColor?: string;
    fillOpacity?: number;
    onClickAttribute?: () => void; // Optional click handler
}

export interface GeoJSONFeature {
    geoJSON: string; // Mendix attribute for GeoJSON string
    color?: string; // Optional styling properties
    stroke?: boolean;
    weight?: number;
    opacity?: number;
    fill?: boolean;
    fillColor?: string;
    fillOpacity?: number;
    onClickAttribute?: () => void; // Optional click handler
}


export interface DrawingProps {
    enableDrawing: boolean;
    drawingTools: DrawingToolsEnum;
    drawnGeoJSONAttribute?: EditableValue<string>;
    onDrawComplete?: ActionValue;
    allowEdit: boolean;
    allowDelete: boolean;
}

export interface SharedProps extends Dimensions {
    autoZoom: boolean;
    optionZoomControl: boolean;
    zoomLevel: number;
    optionDrag: boolean;
    optionScroll: boolean;
    showCurrentLocation: boolean;
    currentLocation?: Marker;
    locations: Marker[];
    mapsToken?: string;
    className?: string;
    style?: CSSProperties;
    features: GeoJSONFeature[];
}

export interface SharedPropsWithDrawing extends SharedProps, DrawingProps {}
