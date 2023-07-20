import { renderHook } from "@testing-library/react";
import { usePlotChartDataSeries, PlotDataSeries, SeriesMapper } from "../usePlotChartDataSeries";
import { ListValueBuilder, ListAttributeValueBuilder, EditableValueBuilder } from "@mendix/pluggable-test-utils";
import { ObjectItem } from "mendix";

function basicDataSetProps(): PlotDataSeries {
    const xAttr = new ListAttributeValueBuilder<string>().withType("String").build();
    xAttr.get = jest.fn().mockReturnValue(new EditableValueBuilder().withValue("0").build());
    const yAttr = new ListAttributeValueBuilder<string>().withType("String").build();
    yAttr.get = jest.fn().mockReturnValue(new EditableValueBuilder().withValue("0").build());

    const dataSetProps: PlotDataSeries = {
        dataSet: "static",
        staticDataSource: ListValueBuilder().withItems([{ id: "2000" } as ObjectItem, { id: "2005" } as ObjectItem]),
        staticXAttribute: xAttr,
        staticYAttribute: yAttr,
        customSeriesOptions: undefined
    };

    return dataSetProps;
}

describe("usePlotChartDataSeries", () => {
    describe("with ActionValue", () => {
        describe("with grouping off (single series)", () => {
            it("should create onClick prop for each data point", () => {
                const set1 = basicDataSetProps();
                const set2 = basicDataSetProps();
                const { result } = renderHook(
                    (props: { series: PlotDataSeries[]; mapFn: SeriesMapper<PlotDataSeries> }) =>
                        usePlotChartDataSeries(props.series, props.mapFn),
                    {
                        initialProps: { series: [set1, set2], mapFn: _ => ({}) }
                    }
                );
                const [data1, data2] = result.current ?? [];
                expect(data1.onClick).toBeInstanceOf(Function);
                expect(data2.onClick).toBeInstanceOf(Function);
            });

            it("should call ActionValue with corresponding ObjectItem", () => {
                expect(true).toBeFalsy();
            });
        });

        describe("with grouping on (multiple series)", () => {
            it("should create onClick prop for each data point", () => {
                expect(true).toBe(false);
            });

            it("should call ActionValue with corresponding ObjectItem", () => {
                expect(true).toBeFalsy();
            });
        });
    });
});
