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
    const isDrawingActiveRef = useRef<boolean>(false);
    const isEditingActiveRef = useRef<boolean>(false);

    const { enableDrawing, drawingTools, drawnGeoJSONAttribute, onDrawComplete, allowEdit, allowDelete } = props;

    // Use refs to store stable callback references
    const saveDrawnItemsRef = useRef<() => void>();
    const loadExistingDrawingsRef = useRef<() => void>();

    // Create stable callback functions using refs with enhanced error handling
    saveDrawnItemsRef.current = () => {
        if (!drawnItemsRef.current || !drawnGeoJSONAttribute || drawnGeoJSONAttribute.readOnly) {
            console.warn("SaveDrawnItems: Cannot save - missing requirements");
            return;
        }

        let attempts = 0;
        const maxAttempts = 3;

        const attemptSave = (): void => {
            attempts++;
            try {
                const layers = getFeatureGroupLayers(drawnItemsRef.current!);
                console.log(`SaveDrawnItems: Attempt ${attempts} - Found ${layers.length} layers`);

                if (layers.length === 0) {
                    // Clear the attribute if no drawings
                    drawnGeoJSONAttribute.setValue("");
                    console.log("SaveDrawnItems: Cleared attribute - no drawings");
                    return;
                }

                // Validate layers before conversion
                const validLayers = layers.filter(layer => {
                    try {
                        return layer && typeof (layer as any).toGeoJSON === "function";
                    } catch {
                        return false;
                    }
                });

                if (validLayers.length !== layers.length) {
                    console.warn(`SaveDrawnItems: ${layers.length - validLayers.length} invalid layers filtered out`);
                }

                if (validLayers.length === 0) {
                    console.warn("SaveDrawnItems: No valid layers to save");
                    return;
                }

                const result = layersToFeatureCollection(validLayers);
                if (result.success && result.featureCollection) {
                    const geoJSONString = JSON.stringify(result.featureCollection);

                    // Validate GeoJSON before saving
                    try {
                        JSON.parse(geoJSONString); // Ensure it's valid JSON
                        drawnGeoJSONAttribute.setValue(geoJSONString);
                        console.log(`SaveDrawnItems: Successfully saved ${validLayers.length} drawings to attribute`);
                    } catch (jsonError) {
                        throw new Error(`Invalid JSON generated: ${jsonError}`);
                    }
                } else {
                    throw new Error(`Failed to convert drawings to GeoJSON: ${result.error}`);
                }
            } catch (error) {
                console.error(`SaveDrawnItems: Attempt ${attempts} failed:`, error);

                if (attempts < maxAttempts) {
                    console.log(`SaveDrawnItems: Retrying in ${attempts * 100}ms...`);
                    setTimeout(attemptSave, attempts * 100);
                } else {
                    console.error("SaveDrawnItems: Max attempts reached, giving up");
                    // Could show user notification here in the future
                }
            }
        };

        attemptSave();
    };

    loadExistingDrawingsRef.current = () => {
        if (!drawnItemsRef.current) {
            console.warn("LoadExistingDrawings: No drawn items ref available");
            return;
        }

        if (!drawnGeoJSONAttribute?.value || drawnGeoJSONAttribute.value.trim() === "") {
            console.log("LoadExistingDrawings: No existing drawings to load");
            return;
        }

        try {
            console.log("LoadExistingDrawings: Loading from attribute...");

            // Clear existing layers first
            drawnItemsRef.current.clearLayers();

            // Validate JSON first
            let geoJSONValue: string;
            try {
                // Test if it's valid JSON
                JSON.parse(drawnGeoJSONAttribute.value);
                geoJSONValue = drawnGeoJSONAttribute.value;
            } catch (jsonError) {
                console.error("LoadExistingDrawings: Invalid JSON in attribute:", jsonError);
                return;
            }

            const result = createLayersFromGeoJSON(geoJSONValue);
            if (result.success && result.layers.length > 0) {
                let loadedCount = 0;
                result.layers.forEach(layer => {
                    try {
                        if (drawnItemsRef.current && layer) {
                            drawnItemsRef.current.addLayer(layer);
                            loadedCount++;
                        }
                    } catch (layerError) {
                        console.warn("LoadExistingDrawings: Failed to add layer:", layerError);
                    }
                });
                console.log(
                    `LoadExistingDrawings: Successfully loaded ${loadedCount}/${result.layers.length} drawings`
                );
            } else {
                console.warn("LoadExistingDrawings: Failed to create layers:", result.error);
            }
        } catch (error) {
            console.error("LoadExistingDrawings: Unexpected error:", error);
            // Clear layers on error to prevent corruption
            if (drawnItemsRef.current) {
                drawnItemsRef.current.clearLayers();
            }
        }
    };

    // Wrapper functions to call the refs
    const saveDrawnItems = useCallback(() => {
        saveDrawnItemsRef.current?.();
    }, []);

    const loadExistingDrawings = useCallback(() => {
        loadExistingDrawingsRef.current?.();
    }, []);

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
                          showArea: false, // Disable area calculation to avoid measurement errors
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
                      circlemarker: false, // Explicitly disable circlemarker
                      marker: true
                  }
                : {
                      polygon: {
                          allowIntersection: false,
                          showArea: false, // Disable area calculation to avoid measurement errors
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
                      circlemarker: false, // Explicitly disable circlemarker
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

        // Event handlers with drawing state tracking
        const onDrawStart = (_e: any): void => {
            isDrawingActiveRef.current = true;
            console.log("Drawing started");
        };

        const onDrawStop = (_e: any): void => {
            isDrawingActiveRef.current = false;
            console.log("Drawing stopped");
        };

        const onEditStart = (_e: any): void => {
            isEditingActiveRef.current = true;
            console.log("Editing started");
        };

        const onEditStop = (_e: any): void => {
            isEditingActiveRef.current = false;
            console.log("Editing stopped");
        };

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
            } finally {
                isDrawingActiveRef.current = false;
            }
        };

        const onDrawEdited = (_e: any): void => {
            try {
                saveDrawnItems();
                console.log("Drawing edited");
            } finally {
                isEditingActiveRef.current = false;
            }
        };

        const onDrawDeleted = (_e: any): void => {
            try {
                saveDrawnItems();
                console.log("Drawing deleted");
            } finally {
                isEditingActiveRef.current = false;
            }
        };

        // Bind events using Leaflet Draw event constants
        const Draw = (L as any).Draw;
        if (Draw?.Event) {
            map.on(Draw.Event.DRAWSTART, onDrawStart);
            map.on(Draw.Event.DRAWSTOP, onDrawStop);
            map.on(Draw.Event.EDITSTART, onEditStart);
            map.on(Draw.Event.EDITSTOP, onEditStop);
            map.on(Draw.Event.CREATED, onDrawCreated);
            map.on(Draw.Event.EDITED, onDrawEdited);
            map.on(Draw.Event.DELETED, onDrawDeleted);
        } else {
            // Fallback to string events if constants not available
            map.on("draw:drawstart" as any, onDrawStart);
            map.on("draw:drawstop" as any, onDrawStop);
            map.on("draw:editstart" as any, onEditStart);
            map.on("draw:editstop" as any, onEditStop);
            map.on("draw:created" as any, onDrawCreated);
            map.on("draw:edited" as any, onDrawEdited);
            map.on("draw:deleted" as any, onDrawDeleted);
        }

        // Cleanup function
        return () => {
            const Draw = (L as any).Draw;
            if (Draw?.Event) {
                map.off(Draw.Event.DRAWSTART, onDrawStart);
                map.off(Draw.Event.DRAWSTOP, onDrawStop);
                map.off(Draw.Event.EDITSTART, onEditStart);
                map.off(Draw.Event.EDITSTOP, onEditStop);
                map.off(Draw.Event.CREATED, onDrawCreated);
                map.off(Draw.Event.EDITED, onDrawEdited);
                map.off(Draw.Event.DELETED, onDrawDeleted);
            } else {
                map.off("draw:drawstart" as any, onDrawStart);
                map.off("draw:drawstop" as any, onDrawStop);
                map.off("draw:editstart" as any, onEditStart);
                map.off("draw:editstop" as any, onEditStop);
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

            // Reset drawing state
            isDrawingActiveRef.current = false;
            isEditingActiveRef.current = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        enableDrawing,
        map,
        drawingTools,
        allowEdit,
        allowDelete,
        onDrawComplete
        // Intentionally using refs for saveDrawnItems and loadExistingDrawings to prevent re-initialization
    ]);

    // Update existing drawings when attribute value changes externally
    useEffect(() => {
        if (enableDrawing && drawnItemsRef.current && drawnGeoJSONAttribute?.value) {
            loadExistingDrawings();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enableDrawing, drawnGeoJSONAttribute?.value]);

    // Expose drawing state globally for other components to check
    useEffect(() => {
        if (typeof window !== "undefined") {
            (window as any).isLeafletDrawingActive = () => isDrawingActiveRef.current || isEditingActiveRef.current;
        }
    }, []);

    return null;
}
