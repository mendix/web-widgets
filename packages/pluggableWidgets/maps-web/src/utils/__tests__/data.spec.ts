import { ValueStatus } from "mendix";
import { dynamic, list, obj, listAttribute, listAction } from "@mendix/widget-plugin-test-utils";
import { DynamicMarkersType, MarkersType } from "../../../typings/MapsProps";
import { convertDynamicModeledMarker, convertStaticModeledMarker } from "../data";

describe("data.ts - Marker Conversion Functions", () => {
    describe("convertStaticModeledMarker", () => {
        it("should convert marker with all fields present", () => {
            const mockAction = jest.fn();
            const marker: MarkersType = {
                address: dynamic("123 Main St"),
                latitude: dynamic("40.7128"),
                longitude: dynamic("-74.0060"),
                title: dynamic("New York"),
                onClick: { canExecute: true, isExecuting: false, execute: mockAction },
                customMarker: dynamic({ uri: "marker.png" } as any),
                locationType: "latlng",
                markerStyle: "image"
            };

            const result = convertStaticModeledMarker(marker);

            expect(result).toEqual({
                address: "123 Main St",
                latitude: 40.7128,
                longitude: -74.006,
                title: "New York",
                action: mockAction,
                customMarker: "marker.png"
            });
        });

        it("should handle undefined optional fields", () => {
            const marker: MarkersType = {
                address: undefined,
                latitude: undefined,
                longitude: undefined,
                title: undefined,
                onClick: undefined,
                customMarker: undefined,
                locationType: "latlng",
                markerStyle: "default"
            };

            const result = convertStaticModeledMarker(marker);

            expect(result).toEqual({
                address: undefined,
                latitude: undefined,
                longitude: undefined,
                title: undefined,
                action: undefined,
                customMarker: undefined
            });
        });

        it("should parse numbers with comma as decimal separator", () => {
            const marker: MarkersType = {
                latitude: dynamic("40,7128"),
                longitude: dynamic("-74,0060"),
                locationType: "latlng",
                markerStyle: "default"
            };

            const result = convertStaticModeledMarker(marker);

            expect(result.latitude).toBe(40.7128);
            expect(result.longitude).toBe(-74.006);
        });

        it("should parse numbers with period as decimal separator", () => {
            const marker: MarkersType = {
                latitude: dynamic("40.7128"),
                longitude: dynamic("-74.0060"),
                locationType: "latlng",
                markerStyle: "default"
            };

            const result = convertStaticModeledMarker(marker);

            expect(result.latitude).toBe(40.7128);
            expect(result.longitude).toBe(-74.006);
        });

        it("should handle empty customMarker image", () => {
            const marker: MarkersType = {
                latitude: dynamic("40"),
                longitude: dynamic("-74"),
                customMarker: dynamic(undefined as any),
                locationType: "latlng",
                markerStyle: "image"
            };

            const result = convertStaticModeledMarker(marker);

            expect(result.customMarker).toBeUndefined();
        });
    });

    describe("convertDynamicModeledMarker", () => {
        describe("Datasource Availability", () => {
            it("should return empty array when datasource is undefined", () => {
                const marker: DynamicMarkersType = {
                    markersDS: undefined,
                    locationType: "latlng",
                    markerStyleDynamic: "default"
                };

                const result = convertDynamicModeledMarker(marker);

                expect(result).toEqual([]);
            });

            it("should return empty array when datasource status is Loading", () => {
                const marker: DynamicMarkersType = {
                    markersDS: list.loading(),
                    locationType: "latlng",
                    markerStyleDynamic: "default"
                };

                const result = convertDynamicModeledMarker(marker);

                expect(result).toEqual([]);
            });

            it("should return empty array when datasource status is Unavailable", () => {
                const datasource = list(0);
                (datasource as any).status = ValueStatus.Unavailable;

                const marker: DynamicMarkersType = {
                    markersDS: datasource,
                    locationType: "latlng",
                    markerStyleDynamic: "default"
                };

                const result = convertDynamicModeledMarker(marker);

                expect(result).toEqual([]);
            });

            it("should return empty array when datasource has no items", () => {
                const marker: DynamicMarkersType = {
                    markersDS: list([]),
                    locationType: "latlng",
                    markerStyleDynamic: "default"
                };

                const result = convertDynamicModeledMarker(marker);

                expect(result).toEqual([]);
            });

            it("should return empty array when datasource items is undefined", () => {
                const datasource = list(0);
                (datasource as any).items = undefined;

                const marker: DynamicMarkersType = {
                    markersDS: datasource,
                    locationType: "latlng",
                    markerStyleDynamic: "default"
                };

                const result = convertDynamicModeledMarker(marker);

                expect(result).toEqual([]);
            });
        });

        describe("Coordinates Location Type", () => {
            it("should convert single marker with coordinates", () => {
                const item = obj("item1");

                const marker: DynamicMarkersType = {
                    markersDS: list([item]),
                    locationType: "latlng",
                    latitude: listAttribute(() => "40.7128" as any),
                    longitude: listAttribute(() => "-74.0060" as any),
                    title: listAttribute(() => "NYC"),
                    markerStyleDynamic: "default"
                };

                const result = convertDynamicModeledMarker(marker);

                expect(result).toHaveLength(1);
                expect(result[0]).toMatchObject({
                    latitude: 40.7128,
                    longitude: -74.006,
                    title: "NYC"
                });
                expect(result[0].id).toBe("obj_item1");
            });

            it("should convert multiple markers with coordinates", () => {
                const item1 = obj("item1");
                const item2 = obj("item2");
                const item3 = obj("item3");

                const marker: DynamicMarkersType = {
                    markersDS: list([item1, item2, item3]),
                    locationType: "latlng",
                    latitude: listAttribute(item => {
                        if (item.id === "obj_item1") return "40" as any;
                        if (item.id === "obj_item2") return "41" as any;
                        return "42" as any;
                    }),
                    longitude: listAttribute(item => {
                        if (item.id === "obj_item1") return "-74" as any;
                        if (item.id === "obj_item2") return "-75" as any;
                        return "-76" as any;
                    }),
                    markerStyleDynamic: "default"
                };

                const result = convertDynamicModeledMarker(marker);

                expect(result).toHaveLength(3);
                expect(result.find(r => r.latitude === 40)).toBeDefined();
                expect(result.find(r => r.latitude === 41)).toBeDefined();
                expect(result.find(r => r.latitude === 42)).toBeDefined();
            });

            it("should handle missing latitude attribute", () => {
                const item = obj("item1");

                const marker: DynamicMarkersType = {
                    markersDS: list([item]),
                    locationType: "latlng",
                    latitude: undefined,
                    longitude: listAttribute(() => "-74" as any),
                    markerStyleDynamic: "default"
                };

                const result = convertDynamicModeledMarker(marker);

                expect(result).toHaveLength(1);
                expect(result[0].latitude).toBeUndefined();
                expect(result[0].longitude).toBe(-74);
            });

            it("should handle missing longitude attribute", () => {
                const item = obj("item1");

                const marker: DynamicMarkersType = {
                    markersDS: list([item]),
                    locationType: "latlng",
                    latitude: listAttribute(() => "40" as any),
                    longitude: undefined,
                    markerStyleDynamic: "default"
                };

                const result = convertDynamicModeledMarker(marker);

                expect(result).toHaveLength(1);
                expect(result[0].latitude).toBe(40);
                expect(result[0].longitude).toBeUndefined();
            });
        });

        describe("Address Location Type", () => {
            it("should convert marker with address", () => {
                const item = obj("item1");

                const marker: DynamicMarkersType = {
                    markersDS: list([item]),
                    locationType: "address",
                    address: listAttribute(() => "123 Main St, NYC"),
                    title: listAttribute(() => "New York"),
                    markerStyleDynamic: "default"
                };

                const result = convertDynamicModeledMarker(marker);

                expect(result).toHaveLength(1);
                expect(result[0]).toMatchObject({
                    address: "123 Main St, NYC",
                    title: "New York",
                    latitude: undefined,
                    longitude: undefined
                });
                expect(result[0].id).toBe("obj_item1");
            });

            it("should handle missing address attribute", () => {
                const item = obj("item1");

                const marker: DynamicMarkersType = {
                    markersDS: list([item]),
                    locationType: "address",
                    address: undefined,
                    markerStyleDynamic: "default"
                };

                const result = convertDynamicModeledMarker(marker);

                expect(result).toHaveLength(1);
                expect(result[0].address).toBeUndefined();
            });

            it("should not set latitude/longitude when using address type", () => {
                const item = obj("item1");

                const marker: DynamicMarkersType = {
                    markersDS: list([item]),
                    locationType: "address",
                    address: listAttribute(() => "Main St"),
                    markerStyleDynamic: "default"
                };

                const result = convertDynamicModeledMarker(marker);

                expect(result[0].latitude).toBeUndefined();
                expect(result[0].longitude).toBeUndefined();
                expect(result[0].address).toBe("Main St");
            });
        });

        describe("Optional Fields", () => {
            it("should handle missing title attribute", () => {
                const item = obj("item1");

                const marker: DynamicMarkersType = {
                    markersDS: list([item]),
                    locationType: "latlng",
                    latitude: listAttribute(() => "40" as any),
                    longitude: listAttribute(() => "-74" as any),
                    title: undefined,
                    markerStyleDynamic: "default"
                };

                const result = convertDynamicModeledMarker(marker);

                expect(result).toHaveLength(1);
                expect(result[0].title).toBe("");
            });

            it("should handle onClick action", () => {
                const item = obj("item1");
                const mockExecute = jest.fn();

                const marker: DynamicMarkersType = {
                    markersDS: list([item]),
                    locationType: "latlng",
                    latitude: listAttribute(() => "40" as any),
                    longitude: listAttribute(() => "-74" as any),
                    onClickAttribute: listAction(() => ({
                        canExecute: true,
                        isExecuting: false,
                        execute: mockExecute
                    })),
                    markerStyleDynamic: "default"
                };

                const result = convertDynamicModeledMarker(marker);

                expect(result).toHaveLength(1);
                expect(result[0].action).toBe(mockExecute);
            });

            it("should handle missing onClick action", () => {
                const item = obj("item1");

                const marker: DynamicMarkersType = {
                    markersDS: list([item]),
                    locationType: "latlng",
                    latitude: listAttribute(() => "40" as any),
                    longitude: listAttribute(() => "-74" as any),
                    onClickAttribute: undefined,
                    markerStyleDynamic: "default"
                };

                const result = convertDynamicModeledMarker(marker);

                expect(result).toHaveLength(1);
                expect(result[0].action).toBeUndefined();
            });

            it("should handle custom marker image", () => {
                const item = obj("item1");

                const marker: DynamicMarkersType = {
                    markersDS: list([item]),
                    locationType: "latlng",
                    latitude: listAttribute(() => "40" as any),
                    longitude: listAttribute(() => "-74" as any),
                    customMarkerDynamic: dynamic({ uri: "custom-marker.png" } as any),
                    markerStyleDynamic: "image"
                };

                const result = convertDynamicModeledMarker(marker);

                expect(result).toHaveLength(1);
                expect(result[0].customMarker).toBe("custom-marker.png");
            });

            it("should handle missing custom marker image", () => {
                const item = obj("item1");

                const marker: DynamicMarkersType = {
                    markersDS: list([item]),
                    locationType: "latlng",
                    latitude: listAttribute(() => "40" as any),
                    longitude: listAttribute(() => "-74" as any),
                    customMarkerDynamic: undefined,
                    markerStyleDynamic: "default"
                };

                const result = convertDynamicModeledMarker(marker);

                expect(result).toHaveLength(1);
                expect(result[0].customMarker).toBeUndefined();
            });
        });

        describe("Edge Cases", () => {
            it("should preserve item IDs for all markers", () => {
                const item1 = obj("marker-id-1");
                const item2 = obj("marker-id-2");

                const marker: DynamicMarkersType = {
                    markersDS: list([item1, item2]),
                    locationType: "latlng",
                    latitude: listAttribute(() => "40" as any),
                    longitude: listAttribute(() => "-74" as any),
                    markerStyleDynamic: "default"
                };

                const result = convertDynamicModeledMarker(marker);

                expect(result).toHaveLength(2);
                expect(result[0].id).toBe("obj_marker-id-1");
                expect(result[1].id).toBe("obj_marker-id-2");
            });

            it("should handle empty string title", () => {
                const item = obj("item1");

                const marker: DynamicMarkersType = {
                    markersDS: list([item]),
                    locationType: "latlng",
                    latitude: listAttribute(() => "40" as any),
                    longitude: listAttribute(() => "-74" as any),
                    title: listAttribute(() => ""),
                    markerStyleDynamic: "default"
                };

                const result = convertDynamicModeledMarker(marker);

                expect(result).toHaveLength(1);
                expect(result[0].title).toBe("");
            });
        });
    });
});
