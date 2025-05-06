import { EditableValueBuilder, ListAttributeValueBuilder, list } from "@mendix/widget-plugin-test-utils";
import Big from "big.js";
import { ListAttributeValue } from "mendix";

interface BaseChartSeries {
    aggregationType: string;
    customSeriesOptions: string;
    dataSet: string;
    staticDataSource: ReturnType<typeof list>;
    staticXAttribute: ListAttributeValue<string | Date | Big>;
    staticYAttribute: ListAttributeValue<string | Date | Big>;
}

export function setupBasicSeries(overwriteConfig: Partial<BaseChartSeries>): BaseChartSeries {
    const xAttribute = new ListAttributeValueBuilder<Big>().build();
    const getXAttributeMock = jest.fn();
    getXAttributeMock.mockReturnValueOnce(new EditableValueBuilder<Big>().withValue(new Big(1)).build());
    getXAttributeMock.mockReturnValueOnce(new EditableValueBuilder<Big>().withValue(new Big(2)).build());
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
        staticDataSource: list(2),
        staticXAttribute: xAttribute,
        staticYAttribute: yAttribute
    };
}
