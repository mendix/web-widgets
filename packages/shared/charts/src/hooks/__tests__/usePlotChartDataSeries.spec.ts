import { renderHook } from "@testing-library/react";
import { usePlotChartDataSeries, PlotDataSeries, SeriesMapper } from "../usePlotChartDataSeries";
import { ListAttributeValueBuilder, EditableValueBuilder, list } from "@mendix/pluggable-test-utils";
import { ListAttributeValue, ListExpressionValue, ListActionValue, ListValue } from "mendix";
import { dynamicValue } from "@mendix/pluggable-widgets-commons";

function axisAttr(): ListAttributeValue<string> {
    const attr = new ListAttributeValueBuilder<string>().withType("String").build();
    attr.get = jest.fn().mockReturnValue(new EditableValueBuilder().withValue("0").build());
    return attr;
}

function groupByAttr(groups: string[]): ListAttributeValue<string> {
    let index = 0;
    const attr = new ListAttributeValueBuilder<string>().withType("String").build();
    attr.get = jest.fn(() => {
        const value = new EditableValueBuilder<string>().withValue(groups[index]).build();
        index = index + 1 === groups.length ? 0 : index + 1;
        return value;
    });
    return attr;
}

function singleData(): PlotDataSeries {
    return {
        dataSet: "static",
        staticDataSource: list(8),
        staticXAttribute: axisAttr(),
        staticYAttribute: axisAttr(),
        customSeriesOptions: undefined
    };
}

function multiData(
    params: { n: number; groups: string[]; ds?: ListValue } = { n: 12, groups: ["alpha", "beta"] }
): PlotDataSeries {
    const x = { get: () => dynamicValue(Math.random().toString()) } as unknown as ListExpressionValue<string>;
    return {
        dataSet: "dynamic",
        dynamicDataSource: params.ds ?? list(params.n),
        dynamicXAttribute: axisAttr(),
        dynamicYAttribute: axisAttr(),
        groupByAttribute: groupByAttr(params.groups),
        dynamicName: x,
        customSeriesOptions: undefined
    };
}

describe("with grouping off (single series)", () => {
    describe("with no ActionValue", () => {
        it("return plotly 'trace' array without onClick handler", () => {
            const set1 = singleData();
            const set2 = singleData();
            const { result } = renderHook(
                (props: { series: PlotDataSeries[]; mapFn: SeriesMapper<PlotDataSeries> }) =>
                    usePlotChartDataSeries(props.series, props.mapFn),
                {
                    initialProps: { series: [set1, set2], mapFn: _ => ({}) }
                }
            );
            const [trace1, trace2] = result.current ?? [];
            expect(trace1.onClick).toBeUndefined();
            expect(trace2.onClick).toBeUndefined();
        });
    });
    describe("with ActionValue", () => {
        it("should create onClick prop for each trace", () => {
            const set1 = singleData();
            const set2 = singleData();
            const { result } = renderHook(
                (props: { series: PlotDataSeries[]; mapFn: SeriesMapper<PlotDataSeries> }) =>
                    usePlotChartDataSeries(props.series, props.mapFn),
                {
                    initialProps: { series: [set1, set2], mapFn: _ => ({}) }
                }
            );
            const [trace1, trace2] = result.current ?? [];
            expect(trace1.onClick).toBeInstanceOf(Function);
            expect(trace2.onClick).toBeInstanceOf(Function);
        });
    });
});

describe("with grouping on (multiple series)", () => {
    describe("with no ActionValue", () => {
        it("return plotly 'trace' array without onClick handler", () => {
            const set1 = multiData();
            const set2 = singleData();
            const set3 = multiData({ n: 4, groups: ["left", "right"] });
            const { result } = renderHook(
                (props: { series: PlotDataSeries[]; mapFn: SeriesMapper<PlotDataSeries> }) =>
                    usePlotChartDataSeries(props.series, props.mapFn),
                {
                    initialProps: { series: [set1, set2, set3], mapFn: _ => ({}) }
                }
            );

            expect(result.current).toHaveLength(5);

            for (const trace of result.current ?? []) {
                expect(trace.onClick).toBeUndefined();
            }
        });
    });
    describe("with ActionValue", () => {
        it("should create onClick prop for each trace", () => {
            const set1 = multiData();
            const set2 = singleData();
            const set3 = multiData({ n: 4, groups: ["a", "b", "c"] });
            const actionFn = jest.fn();
            const listAction = {
                get: jest.fn().mockRejectedValue(actionFn)
            } as unknown as ListActionValue;
            const series: PlotDataSeries[] = [set1, set2, set3].map(x => (x.onClickAction = listAction) && x);

            const { result } = renderHook(
                (props: { series: PlotDataSeries[]; mapFn: SeriesMapper<PlotDataSeries> }) =>
                    usePlotChartDataSeries(props.series, props.mapFn),
                {
                    initialProps: { series, mapFn: _ => ({}) }
                }
            );

            expect(result.current).toHaveLength(6);

            for (const trace of result.current ?? []) {
                expect(trace.onClick).toBeInstanceOf(Function);
            }
        });

        // it("should call actionFn with corresponding ObjectItem", () => {
        //     const set1 = multiData({ n: 16, groups: ["a", "b"] });
        //     const actionFn = jest.fn();
        //     const listAction = {
        //         get: jest.fn().mockRejectedValue(actionFn)
        //     } as unknown as ListActionValue;
        //     set1.onClickAction = listAction;
        //     const series: PlotDataSeries[] = [set1];

        //     const { result } = renderHook(
        //         (props: { series: PlotDataSeries[]; mapFn: SeriesMapper<PlotDataSeries> }) =>
        //             usePlotChartDataSeries(props.series, props.mapFn),
        //         {
        //             initialProps: { series, mapFn: _ => ({}) }
        //         }
        //     );

        //     expect(result.current).toHaveLength(2);

        //     const [trace1, trace2] = result.current ?? [];

        //     trace1.onClick?.(1);
        //     expect(actionFn).toHaveBeenLastCalledWith(trace1.dataSourceItems[1]);
        //     expect(trace1.dataSourceItems[1]).toHaveProperty("id");
        //     trace1.onClick?.(3);
        //     expect(trace1.dataSourceItems[3]).toHaveProperty("id");
        //     expect(actionFn).toHaveBeenLastCalledWith(trace1.dataSourceItems[3]);

        //     trace2.onClick?.(0);
        //     expect(trace2.dataSourceItems[0]).toHaveProperty("id");
        //     expect(actionFn).toHaveBeenLastCalledWith(trace2.dataSourceItems[0]);
        //     trace2.onClick?.(5);
        //     expect(trace2.dataSourceItems[5]).toHaveProperty("id");
        //     expect(actionFn).toHaveBeenLastCalledWith(trace2.dataSourceItems[5]);
        // });
    });
});
