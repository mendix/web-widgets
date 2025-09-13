import { useCallback, useEffect, useRef } from "react";
import { useMap } from "react-leaflet";

// Import leaflet-draw to extend Leaflet with drawing capabilities
import "leaflet-draw";
import * as L from "leaflet";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { DrawingProps } from "../../typings/shared";
import {
    createLayersFromGeoJSON,
    getFeatureGroupLayers,
    layersToFeatureCollection,
    layerToGeoJSON
} from "../utils/drawing";

export function LeafletDrawing(props: DrawingProps): null {
    const map = useMap();
    const drawnItemsRef = useRef<L.FeatureGroup>();
    const drawControlRef = useRef<any>();

    const { enableDrawing, drawingTools, drawnGeoJSONAttribute, onDrawComplete, allowEdit, allowDelete } = props;

    const saveDrawnItems = useCallback(() => {
        if (!drawnItemsRef.current || !drawnGeoJSONAttribute || drawnGeoJSONAttribute.readOnly) {
            return;
        }

        try {
            const layers = getFeatureGroupLayers(drawnItemsRef.current);

            if (layers.length === 0) {
                // Clear the attribute if no drawings
                drawnGeoJSONAttribute.setValue("");
                return;
            }

            const result = layersToFeatureCollection(layers);
            if (result.success && result.featureCollection) {
                const geoJSONString = JSON.stringify(result.featureCollection);
                drawnGeoJSONAttribute.setValue(geoJSONString);
                console.log("Saved GeoJSON to attribute:", geoJSONString);
            } else {
                console.error("Failed to convert drawings to GeoJSON:", result.error);
            }
        } catch (error) {
            console.error("Error saving drawn items:", error);
        }
    }, [drawnGeoJSONAttribute]);

    const loadExistingDrawings = useCallback(() => {
        if (!drawnItemsRef.current || !drawnGeoJSONAttribute?.value) {
            return;
        }

        try {
            // Clear existing layers first
            drawnItemsRef.current.clearLayers();

            const result = createLayersFromGeoJSON(drawnGeoJSONAttribute.value);
            if (result.success) {
                result.layers.forEach(layer => {
                    if (drawnItemsRef.current) {
                        drawnItemsRef.current.addLayer(layer);
                    }
                });
                console.log("Loaded existing drawings from attribute");
            } else {
                console.warn("Failed to load existing drawings:", result.error);
            }
        } catch (error) {
            console.error("Error loading existing drawings:", error);
        }
    }, [drawnGeoJSONAttribute?.value]);

    useEffect(() => {
        if (!enableDrawing || !map) {
            return;
        }

        // Ensure map is fully initialized
        if (!map.getContainer()) {
            console.warn("Map container not ready for drawing controls");
            return;
        }

        // Initialize drawn items feature group
        const drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);
        drawnItemsRef.current = drawnItems;

        // Configure drawing options based on drawingTools setting
        const drawOptions =
            drawingTools === "all"
                ? {
                      polygon: {
                          allowIntersection: false,
                          showArea: true,
                          shapeOptions: {
                              color: "#2E7D32",
                              fillColor: "#81C784",
                              fillOpacity: 0.3,
                              weight: 3
                          }
                      },
                      rectangle: {
                          shapeOptions: {
                              color: "#1565C0",
                              fillColor: "#42A5F5",
                              fillOpacity: 0.3,
                              weight: 3
                          }
                      },
                      polyline: {
                          shapeOptions: {
                              color: "#E91E63",
                              weight: 4
                          }
                      },
                      circle: {
                          shapeOptions: {
                              color: "#7B1FA2",
                              fillColor: "#BA68C8",
                              fillOpacity: 0.3,
                              weight: 3
                          }
                      },
                      marker: true
                  }
                : {
                      polygon: {
                          allowIntersection: false,
                          showArea: true,
                          shapeOptions: {
                              color: "#2E7D32",
                              fillColor: "#81C784",
                              fillOpacity: 0.3,
                              weight: 3
                          }
                      },
                      rectangle: false,
                      polyline: false,
                      circle: false,
                      marker: false
                  };

        // Initialize draw control with proper typing
        const DrawControl = (L.Control as any).Draw;

        // Check if Draw control is available
        if (!DrawControl) {
            console.error("Leaflet Draw control not loaded");
            return;
        }

        const drawControl = new DrawControl({
            position: "topright",
            draw: drawOptions,
            edit: {
                featureGroup: drawnItems,
                edit: allowEdit !== false ? {} : false,
                remove: allowDelete !== false ? {} : false
            }
        });

        map.addControl(drawControl);
        drawControlRef.current = drawControl;

        // Load existing drawings
        loadExistingDrawings();

        // Event handlers
        const onDrawCreated = (e: any): void => {
            try {
                const layer = e.layer;

                if (!layer) {
                    console.error("No layer found in draw:created event");
                    return;
                }

                // Add layer to the feature group
                if (drawnItemsRef.current) {
                    drawnItemsRef.current.addLayer(layer);
                } else {
                    drawnItems.addLayer(layer);
                }

                saveDrawnItems();

                // Execute Mendix action if configured
                if (onDrawComplete) {
                    executeAction(onDrawComplete);
                }

                console.log("Drawing created:", layerToGeoJSON(layer));
            } catch (error) {
                console.error("Error handling draw:created event:", error);
            }
        };

        const onDrawEdited = (_e: any): void => {
            saveDrawnItems();
            console.log("Drawing edited");
        };

        const onDrawDeleted = (_e: any): void => {
            saveDrawnItems();
            console.log("Drawing deleted");
        };

        // Bind events using Leaflet Draw event constants
        const Draw = (L as any).Draw;
        if (Draw?.Event) {
            map.on(Draw.Event.CREATED, onDrawCreated);
            map.on(Draw.Event.EDITED, onDrawEdited);
            map.on(Draw.Event.DELETED, onDrawDeleted);
        } else {
            // Fallback to string events if constants not available
            map.on("draw:created" as any, onDrawCreated);
            map.on("draw:edited" as any, onDrawEdited);
            map.on("draw:deleted" as any, onDrawDeleted);
        }

        // Cleanup function
        return () => {
            const Draw = (L as any).Draw;
            if (Draw?.Event) {
                map.off(Draw.Event.CREATED, onDrawCreated);
                map.off(Draw.Event.EDITED, onDrawEdited);
                map.off(Draw.Event.DELETED, onDrawDeleted);
            } else {
                map.off("draw:created" as any, onDrawCreated);
                map.off("draw:edited" as any, onDrawEdited);
                map.off("draw:deleted" as any, onDrawDeleted);
            }

            if (drawControlRef.current) {
                map.removeControl(drawControlRef.current);
            }
            if (drawnItemsRef.current) {
                map.removeLayer(drawnItemsRef.current);
            }
        };
    }, [
        enableDrawing,
        map,
        drawingTools,
        allowEdit,
        allowDelete,
        saveDrawnItems,
        loadExistingDrawings,
        onDrawComplete
    ]);

    // Update existing drawings when attribute value changes externally
    useEffect(() => {
        if (enableDrawing && drawnItemsRef.current) {
            loadExistingDrawings();
        }
    }, [enableDrawing, loadExistingDrawings]);

    return null;
}
