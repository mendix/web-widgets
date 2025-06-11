jest.mock("@mendix/shared-charts/main", () => {
    const actualModule = jest.requireActual("@mendix/shared-charts/main");
    return {
        ...actualModule,
        ChartWidget: jest.fn(() => null)
    };
});

import { ChartWidget } from "@mendix/shared-charts/main";
import { dynamic, EditableValueBuilder, list, ListAttributeValueBuilder } from "@mendix/widget-plugin-test-utils";
import "@testing-library/jest-dom";
import { render, RenderResult } from "@testing-library/react";
import Big from "big.js";
import { createElement } from "react";
import { LinesType, TimeSeriesContainerProps } from "../../typings/TimeSeriesProps";
import { TimeSeries } from "../TimeSeries";

describe("The TimeSeries widget", () => {
    function renderTimeSeries(
        configs: Array<Partial<LinesType>>,
        props?: Partial<TimeSeriesContainerProps>
    ): RenderResult {
        return render(
            <TimeSeries
                name="time-series-test"
                class="time-series-class"
                lines={configs.map(setupBasicSeries)}
                showLegend={false}
                enableAdvancedOptions={false}
                widthUnit="percentage"
                width={0}
                heightUnit="pixels"
                height={0}
                gridLines="none"
                customLayout=""
                customConfigurations=""
                enableThemeConfig={false}
                yAxisRangeMode="tozero"
                showRangeSlider
                showPlaygroundSlot={false}
                {...props}
            />
        );
    }
    it("visualizes data as a line chart", () => {
        renderTimeSeries([{}]);

        expect(ChartWidget).toHaveBeenCalledWith(
            expect.objectContaining({
                seriesOptions: expect.objectContaining({
                    type: "scatter"
                })
            }),
            {}
        );
    });

    it("sets the mode on the data series based on the lineStyle value", () => {
        renderTimeSeries([{ lineStyle: "lineWithMarkers" }, { lineStyle: "line" }]);

        expect(ChartWidget).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.arrayContaining([
                    expect.objectContaining({ mode: "lines+markers" }),
                    expect.objectContaining({ mode: "lines" })
                ])
            }),
            {}
        );
    });

    it("sets the line shape on the data series based on the interpolation value", () => {
        renderTimeSeries([{ interpolation: "linear" }, { interpolation: "spline" }]);

        expect(ChartWidget).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.arrayContaining([
                    expect.objectContaining({ line: expect.objectContaining({ shape: "linear" }) }),
                    expect.objectContaining({ line: expect.objectContaining({ shape: "spline" }) })
                ])
            }),
            {}
        );
    });

    it("sets the line color on the data series based on the lineColor value", () => {
        renderTimeSeries([{ lineColor: dynamic("red") }, { lineColor: undefined }]);

        expect(ChartWidget).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.arrayContaining([
                    expect.objectContaining({ line: expect.objectContaining({ color: "red" }) }),
                    expect.objectContaining({ line: expect.objectContaining({ color: undefined }) })
                ])
            }),
            {}
        );
    });

    it("sets the marker color on the data series based on the markerColor value", () => {
        renderTimeSeries([{ markerColor: undefined }, { markerColor: dynamic("blue") }]);

        expect(ChartWidget).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.arrayContaining([
                    expect.objectContaining({ marker: expect.objectContaining({ color: undefined }) }),
                    expect.objectContaining({ marker: expect.objectContaining({ color: "blue" }) })
                ])
            }),
            {}
        );
    });

    it("aggregates data based on the aggregation type", () => {
        renderTimeSeries([{ aggregationType: "none" }, { aggregationType: "avg" }]);

        expect(ChartWidget).toHaveBeenCalledTimes(2);
        expect(ChartWidget).toHaveBeenLastCalledWith(
            expect.objectContaining({
                data: expect.arrayContaining([
                    expect.objectContaining({
                        x: expect.arrayContaining([expect.any(Date)]),
                        y: expect.arrayContaining([expect.any(Number)])
                    }),
                    expect.objectContaining({
                        x: expect.arrayContaining([expect.any(String)]),
                        y: expect.arrayContaining([expect.any(Number)])
                    })
                ])
            }),
            {}
        );
    });

    it("sets the area fill color on the data series based on fillColor", () => {
        renderTimeSeries([{ fillColor: dynamic("red") }]);

        expect(ChartWidget).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.arrayContaining([expect.objectContaining({ fillcolor: "red" })])
            }),
            {}
        );
    });

    it("sets rangeslider visibility on the layout configuration based on showRangeSlider", () => {
        renderTimeSeries([], { showRangeSlider: true });

        expect(ChartWidget).toHaveBeenCalledWith(
            expect.objectContaining({
                layoutOptions: expect.objectContaining({
                    xaxis: expect.objectContaining({
                        rangeslider: expect.objectContaining({
                            visible: true
                        })
                    })
                })
            }),
            {}
        );
    });

    it("sets yaxis rangemode on the layout configuration based on yAxisRangeMode", () => {
        renderTimeSeries([], { yAxisRangeMode: "nonnegative" });

        expect(ChartWidget).toHaveBeenCalledWith(
            expect.objectContaining({
                layoutOptions: expect.objectContaining({
                    yaxis: expect.objectContaining({
                        rangemode: "nonnegative"
                    })
                })
            }),
            {}
        );
    });
});

function setupBasicSeries(overwriteConfig: Partial<LinesType>): LinesType {
    const xAttribute = new ListAttributeValueBuilder<Date>().build();
    const getXAttributeMock = jest.fn();

    const firstDate = new Date("2022-01-01");
    jest.spyOn(firstDate, "toLocaleDateString").mockReturnValue("01/01/2022");
    getXAttributeMock.mockReturnValueOnce(new EditableValueBuilder<Date>().withValue(firstDate).build());

    const secondDate = new Date("2022-01-02");
    jest.spyOn(secondDate, "toLocaleDateString").mockReturnValue("02/01/2022");
    getXAttributeMock.mockReturnValueOnce(new EditableValueBuilder<Date>().withValue(secondDate).build());

    xAttribute.get = getXAttributeMock;

    const yAttribute = new ListAttributeValueBuilder<Big>().build();
    const getYAttributeMock = jest.fn();
    getYAttributeMock.mockReturnValueOnce(new EditableValueBuilder<Big>().withValue(new Big(3)).build());
    getYAttributeMock.mockReturnValueOnce(new EditableValueBuilder<Big>().withValue(new Big(6)).build());
    yAttribute.get = getYAttributeMock;

    return {
        dataSet: "static",
        customSeriesOptions: overwriteConfig.customSeriesOptions ?? "",
        aggregationType: overwriteConfig.aggregationType ?? "avg",
        interpolation: overwriteConfig.interpolation ?? "linear",
        lineStyle: overwriteConfig.lineStyle ?? "line",
        lineColor: overwriteConfig.lineColor ?? undefined,
        markerColor: overwriteConfig.markerColor ?? undefined,
        fillColor: overwriteConfig.fillColor ?? undefined,
        staticDataSource: list(2),
        staticXAttribute: xAttribute,
        staticYAttribute: yAttribute,
        enableFillArea: true
    };
}
