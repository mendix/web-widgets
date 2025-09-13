import { Feature, FeatureCollection, Geometry } from "geojson";
import L from "leaflet";

export interface DrawingUtilsResult {
    success: boolean;
    error?: string;
    feature?: Feature;
    featureCollection?: FeatureCollection;
}

/**
 * Convert a Leaflet layer to a GeoJSON Feature
 */
export function layerToGeoJSON(layer: L.Layer): DrawingUtilsResult {
    try {
        if (!layer || typeof (layer as any).toGeoJSON !== "function") {
            return {
                success: false,
                error: "Layer does not support GeoJSON conversion"
            };
        }

        const geoJSON = (layer as any).toGeoJSON();

        // Ensure it's a proper Feature
        if (geoJSON.type !== "Feature") {
            return {
                success: false,
                error: "Invalid GeoJSON Feature format"
            };
        }

        return {
            success: true,
            feature: geoJSON as Feature
        };
    } catch (error) {
        return {
            success: false,
            error: `Failed to convert layer to GeoJSON: ${error instanceof Error ? error.message : "Unknown error"}`
        };
    }
}

/**
 * Convert multiple Leaflet layers to a GeoJSON FeatureCollection
 */
export function layersToFeatureCollection(layers: L.Layer[]): DrawingUtilsResult {
    try {
        const features: Feature[] = [];

        for (const layer of layers) {
            const result = layerToGeoJSON(layer);
            if (result.success && result.feature) {
                features.push(result.feature);
            }
        }

        const featureCollection: FeatureCollection = {
            type: "FeatureCollection",
            features
        };

        return {
            success: true,
            featureCollection
        };
    } catch (error) {
        return {
            success: false,
            error: `Failed to convert layers to FeatureCollection: ${error instanceof Error ? error.message : "Unknown error"}`
        };
    }
}

/**
 * Parse GeoJSON string and validate format
 */
export function parseGeoJSON(geoJSONString: string): DrawingUtilsResult {
    try {
        if (!geoJSONString || geoJSONString.trim() === "") {
            return {
                success: false,
                error: "Empty GeoJSON string"
            };
        }

        const parsed = JSON.parse(geoJSONString);

        // Validate basic GeoJSON structure
        if (!parsed || typeof parsed !== "object") {
            return {
                success: false,
                error: "Invalid GeoJSON format"
            };
        }

        // Handle both Feature and FeatureCollection
        if (parsed.type === "Feature") {
            return {
                success: true,
                feature: parsed as Feature
            };
        } else if (parsed.type === "FeatureCollection") {
            return {
                success: true,
                featureCollection: parsed as FeatureCollection
            };
        } else {
            return {
                success: false,
                error: "GeoJSON must be either a Feature or FeatureCollection"
            };
        }
    } catch (error) {
        return {
            success: false,
            error: `Failed to parse GeoJSON: ${error instanceof Error ? error.message : "Invalid JSON"}`
        };
    }
}

/**
 * Create Leaflet layers from GeoJSON data
 */
export function createLayersFromGeoJSON(geoJSONString: string): {
    success: boolean;
    layers: L.Layer[];
    error?: string;
} {
    try {
        const parseResult = parseGeoJSON(geoJSONString);
        if (!parseResult.success) {
            return {
                success: false,
                layers: [],
                error: parseResult.error
            };
        }

        const layers: L.Layer[] = [];

        if (parseResult.feature) {
            // Single feature
            const layer = L.geoJSON(parseResult.feature);
            layer.eachLayer(subLayer => {
                layers.push(subLayer);
            });
        } else if (parseResult.featureCollection) {
            // Feature collection
            const layer = L.geoJSON(parseResult.featureCollection);
            layer.eachLayer(subLayer => {
                layers.push(subLayer);
            });
        }

        return {
            success: true,
            layers
        };
    } catch (error) {
        return {
            success: false,
            layers: [],
            error: `Failed to create layers from GeoJSON: ${error instanceof Error ? error.message : "Unknown error"}`
        };
    }
}

/**
 * Get all layers from a FeatureGroup as an array
 */
export function getFeatureGroupLayers(featureGroup: L.FeatureGroup): L.Layer[] {
    const layers: L.Layer[] = [];
    featureGroup.eachLayer(layer => {
        layers.push(layer);
    });
    return layers;
}

/**
 * Validate if geometry is supported for drawing
 */
export function isSupportedGeometry(geometry: Geometry): boolean {
    const supportedTypes = ["Polygon", "MultiPolygon", "LineString", "MultiLineString", "Point"];

    return supportedTypes.includes(geometry.type);
}

/**
 * Get human-readable error messages for common issues
 */
export function getDrawingErrorMessage(error: string): string {
    const errorMappings: Record<string, string> = {
        "Empty GeoJSON string": "No drawing data found.",
        "Invalid GeoJSON format": "The saved drawing data is corrupted.",
        "Invalid JSON": "The drawing data format is invalid.",
        "Layer does not support GeoJSON conversion": "This shape cannot be saved.",
        "GeoJSON must be either a Feature or FeatureCollection": "Unsupported drawing format."
    };

    return errorMappings[error] || `Drawing error: ${error}`;
}
