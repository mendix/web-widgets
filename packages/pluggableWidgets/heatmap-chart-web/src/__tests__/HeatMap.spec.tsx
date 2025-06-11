jest.mock("@mendix/shared-charts/main", () => {
    const actualModule = jest.requireActual("@mendix/shared-charts/main");
    return {
        ...actualModule,
        ChartWidget: jest.fn(() => null)
    };
});

import { ChartWidget } from "@mendix/shared-charts/main";
import { EditableValueBuilder, list, ListAttributeValueBuilder } from "@mendix/widget-plugin-test-utils";
import "@testing-library/jest-dom";
import { render, RenderResult } from "@testing-library/react";
import Big from "big.js";
import { createElement } from "react";
import { HeatMapContainerProps } from "../../typings/HeatMapProps";
import { HeatMap } from "../HeatMap";

describe("The HeatMap widget", () => {
    function renderHeatMap(props: Partial<HeatMapContainerProps>): RenderResult {
        return render(
            <HeatMap
                name="line-chart-test"
                class="line-chart-class"
                enableAdvancedOptions={false}
                gridLines={"none"}
                widthUnit="percentage"
                width={0}
                heightUnit="pixels"
                height={0}
                customLayout=""
                customConfigurations=""
                customSeriesOptions=""
                seriesDataSource={list(2)}
                seriesValueAttribute={new ListAttributeValueBuilder<Big>().build()}
                enableThemeConfig={false}
                scaleColors={[]}
                showScale
                horizontalSortOrder="asc"
                verticalSortOrder="asc"
                smoothColor={false}
                showValues={false}
                valuesColor=""
                showPlaygroundSlot={false}
                {...setupBasicAttributes()}
                {...props}
            />
        );
    }

    it("visualizes data as a heatmap chart", () => {
        renderHeatMap({});

        expect(ChartWidget).toHaveBeenCalledWith(
            expect.objectContaining({
                seriesOptions: expect.objectContaining({
                    type: "heatmap"
                })
            }),
            {}
        );
    });

    it("visualizes a heatmap chart properly even if there is no data", () => {
        expect(() =>
            renderHeatMap({
                seriesDataSource: list(0),
                showValues: true
            })
        ).not.toThrow();
    });

    it("has a default colorscale", () => {
        renderHeatMap({});

        expect(ChartWidget).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.arrayContaining([
                    expect.objectContaining({
                        colorscale: [
                            [0, "#17347B"],
                            [0.5, "#0595DB"],
                            [1, "#76CA02"]
                        ]
                    })
                ])
            }),
            {}
        );
    });

    it("creates a color scale based on scaleColors property", () => {
        renderHeatMap({
            scaleColors: [
                { colour: "red", valuePercentage: 0 },
                { colour: "blue", valuePercentage: 100 }
            ]
        });

        expect(ChartWidget).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.arrayContaining([
                    expect.objectContaining({
                        colorscale: [
                            [0, "red"],
                            [1, "blue"]
                        ]
                    })
                ])
            }),
            {}
        );
    });

    it("sets unique x values on the data series based on the horizontalValueAttribute", () => {
        renderHeatMap({});

        expect(ChartWidget).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.arrayContaining([
                    expect.objectContaining({
                        x: ["x0", "x1", "x2"]
                    })
                ])
            }),
            {}
        );
    });

    it("sets unique y values on the data series based on the verticalValueAttribute", () => {
        renderHeatMap({});

        expect(ChartWidget).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.arrayContaining([
                    expect.objectContaining({
                        y: ["y0", "y1", "y2", "y3"]
                    })
                ])
            }),
            {}
        );
    });

    it("sets a proper z values matrix on the data series based on seriesValueAttribute", () => {
        renderHeatMap({});

        const mockCalls = (ChartWidget as jest.Mock).mock.calls;
        const lastCallProps = mockCalls[mockCalls.length - 1][0];
        expect(lastCallProps.data).toHaveLength(1);
        expect(lastCallProps.data[0]).toHaveProperty("z");
        const zValues: number[][] = lastCallProps.data[0].z;
        expect(zValues).toHaveLength(4);
        zValues.forEach(values => {
            expect(values).toHaveLength(3);
        });
    });

    it("sets annotations with the z values on the data series based on showValues", () => {
        renderHeatMap({ showValues: true });

        const mockCalls = (ChartWidget as jest.Mock).mock.calls;
        const lastCallProps = mockCalls[mockCalls.length - 1][0];
        expect(lastCallProps.layoutOptions.annotations).toHaveLength(12);
        const annotationsTexts = lastCallProps.layoutOptions.annotations?.map((anno: any) => anno.text);
        allItems.forEach((_value, index) => {
            expect(annotationsTexts?.includes(index.toString())).toBe(true);
        });
    });

    it("sorts the z values on the data series based on the horizontalSortAttribute", () => {
        const horizontalSortAttribute = new ListAttributeValueBuilder<Big>().build();
        horizontalSortAttribute.get = allItems.reduce<jest.Mock>(
            (prev, _curr, index) =>
                prev.mockReturnValueOnce(new EditableValueBuilder<Big>().withValue(new Big(index)).build()),
            jest.fn()
        );
        renderHeatMap({
            horizontalSortAttribute,
            horizontalSortOrder: "desc"
        });

        const mockCalls = (ChartWidget as jest.Mock).mock.calls;
        const lastCallProps = mockCalls[mockCalls.length - 1][0];
        expect(lastCallProps.data).toHaveLength(1);
        const zValues: number[][] = lastCallProps.data[0].z;
        expect(zValues).toEqual([
            [2, 1, 0],
            [5, 4, 3],
            [8, 7, 6],
            [11, 10, 9]
        ]);
    });

    it("sorts the z values on the data series based on the verticalSortAttribute", () => {
        const verticalSortAttribute = new ListAttributeValueBuilder<Big>().build();
        verticalSortAttribute.get = allItems.reduce<jest.Mock>(
            (prev, _curr, index) =>
                prev.mockReturnValueOnce(new EditableValueBuilder<Big>().withValue(new Big(index)).build()),
            jest.fn()
        );
        renderHeatMap({
            verticalSortAttribute,
            verticalSortOrder: "desc"
        });

        const mockCalls = (ChartWidget as jest.Mock).mock.calls;
        const lastCallProps = mockCalls[mockCalls.length - 1][0];
        expect(lastCallProps.data).toHaveLength(1);
        const zValues: number[][] = lastCallProps.data[0].z;
        expect(zValues).toEqual([
            [11, 10, 9],
            [8, 7, 6],
            [5, 4, 3],
            [2, 1, 0]
        ]);
    });
});

const numberOfHorizontalItems = 3;
const numberOfVerticalItems = 4;
const numberOfItems = numberOfHorizontalItems * numberOfVerticalItems;

const allItems = new Array(numberOfItems).fill(null);

function setupBasicAttributes(): Partial<HeatMapContainerProps> {
    const seriesDataSource = list(numberOfItems);

    const seriesValueAttribute = new ListAttributeValueBuilder<Big>().build();
    seriesValueAttribute.get = allItems.reduce<jest.Mock>(
        (prev, _curr, index) =>
            prev.mockReturnValueOnce(new EditableValueBuilder<Big>().withValue(new Big(index)).build()),
        jest.fn()
    );

    const horizontalAxisAttribute = new ListAttributeValueBuilder<string>().build();
    horizontalAxisAttribute.get = allItems.reduce<jest.Mock>(
        (prev, _curr, index) =>
            prev.mockReturnValueOnce(
                new EditableValueBuilder<string>().withValue(`x${index % numberOfHorizontalItems}`).build()
            ),
        jest.fn()
    );

    const verticalAxisAttribute = new ListAttributeValueBuilder<string>().build();
    verticalAxisAttribute.get = allItems.reduce<jest.Mock>(
        (prev, _curr, index) =>
            prev.mockReturnValueOnce(
                new EditableValueBuilder<string>().withValue(`y${Math.floor(index / numberOfHorizontalItems)}`).build()
            ),
        jest.fn()
    );

    return {
        seriesDataSource,
        seriesValueAttribute,
        horizontalAxisAttribute,
        verticalAxisAttribute
    };
}
