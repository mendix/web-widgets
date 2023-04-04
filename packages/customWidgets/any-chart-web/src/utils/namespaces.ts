export namespace Container {
    export interface WrapperProps {
        class?: string;
        mxform: mxui.lib.form._FormBase;
        mxObject?: mendix.lib.MxObject;
        style?: string;
        readOnly: boolean;
        friendlyId: string;
        uniqueid: string;
    }

    export interface RestParameter {
        parameterAttribute: string;
    }

    export interface AnyChartContainerPropsBase extends WrapperProps, Style.Dimensions {
        dataStatic: string;
        dataAttribute: string;
        sampleData: string;
        layoutStatic: string;
        layoutAttribute: string;
        configurationOptions: string;
        sampleLayout: string;
        eventEntity: string;
        eventDataAttribute: string;
        onClickMicroflow: string;
        onClickNanoflow: Data.Nanoflow;
        tooltipEntity: string;
        tooltipMicroflow: string;
        tooltipForm: string;
    }

    export interface AnyChartContainerProps extends AnyChartContainerPropsBase {
        devMode: "advanced" | "developer";
    }
}

export namespace Data {
    export interface DataSourceProps {
        dataSourceMicroflow: string;
        dataSourceType: "XPath" | "microflow" | "REST";
        restUrl: string;
        restParameters: Container.RestParameter[];
        entityConstraint: string;
        dataEntity: string;
        seriesType: "static" | "dynamic";
        seriesEntity: string;
        seriesNameAttribute: string;
        colorAttribute: string;
        fillColorAttribute: string;
        seriesSortAttribute: string;
        seriesSortOrder: SortOrder;
    }

    export interface SeriesDataSourceProps extends DataSourceProps {
        xValueAttribute: string;
        xValueSortAttribute: string;
        sortOrder: SortOrder;
        yValueAttribute: string;
    }

    export type SortOrder = "asc" | "desc";
    export type AggregationType =
        | "none"
        | "count"
        | "sum"
        | "avg"
        | "min"
        | "max"
        | "median"
        | "mode"
        | "first"
        | "last"
        | "stddev";

    export interface EventProps {
        onClickEvent: "doNothing" | "showPage" | "callMicroflow" | "callNanoflow";
        openPageLocation: "popup" | "modal" | "content";
        onClickPage: string;
        onClickMicroflow: string;
        onClickNanoflow: Nanoflow;
        tooltipForm: string;
    }

    export interface SeriesProps extends SeriesDataSourceProps, EventProps {
        name: string;
        seriesOptions: string;
        barColor: string;
        color?: string; // All serie barColor, lineColor, bubbleColor etc should be replaced with 'color'
        aggregationType: AggregationType;
    }

    export interface Nanoflow {
        nanoflow: object[];
        paramsSpec: { Progress: string };
    }
}

export namespace Style {
    export interface Dimensions {
        width: number;
        height: number;
        widthUnit: "percentage" | "pixels";
        heightUnit: "percentageOfWidth" | "pixels" | "percentageOfParent";
    }

    export interface Appearance {
        refreshInterval: number;
    }
}
