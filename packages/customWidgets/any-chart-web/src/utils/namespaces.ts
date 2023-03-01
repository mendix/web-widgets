import { Datum, ScatterData, ScatterMarker } from "plotly.js";
import { ReactChild } from "react";

export namespace Container {
  export interface MxClick {
    entity: string;
    guid: string;
  }

  export interface WrapperProps {
    class?: string;
    mxform: mxui.lib.form._FormBase;
    mxObject?: mendix.lib.MxObject;
    style?: string;
    readOnly: boolean;
    friendlyId: string;
    uniqueid: string;
  }

  export interface LayoutProps {
    defaultData?: ScatterData[];
    grid: "none" | "horizontal" | "vertical" | "both";
    showLegend: boolean;
    xAxisLabel: string;
    yAxisLabel: string;
    layoutOptions: string;
    configurationOptions: string;
    devMode: DevMode;
  }

  export type DevMode = "basic" | "advanced" | "developer";

  export interface RestParameter {
    parameterAttribute: string;
  }

  export interface AnyChartContainerPropsBase
    extends WrapperProps,
      Style.Dimensions {
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

  export interface AnyChartContainerState {
    alertMessage?: ReactChild;
    loading: boolean;
    attributeData: string;
    attributeLayout: string;
  }
}

export namespace Data {
  export interface FetchedData<T> {
    mxObjects?: mendix.lib.MxObject[];
    restData?: RESTData;
    customData?: T;
  }

  export type RESTData = { [key: string]: string | number }[];

  export interface FetchDataOptions<S> {
    type: "XPath" | "microflow" | "REST";
    entity: string;
    guid: string;
    constraint?: string;
    sortAttribute?: string;
    sortOrder?: SortOrder;
    attributes?: string[];
    microflow?: string;
    url?: string;
    customData?: S; // Usage: when used in a loop, could hold a value specific to each item e.g series
  }

  export interface FetchByXPathOptions {
    guid: string;
    entity: string;
    constraint: string;
    sortAttribute?: string;
    sortOrder?: SortOrder;
    attributes?: string[];
    references?: any;
  }

  export interface FetchByGuidsOptions {
    guids: string[];
    sortAttribute?: string;
    sortOrder?: SortOrder;
    attributes?: string[];
    references?: any;
  }

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

  export interface OnClickOptions<T = any, O extends EventProps = EventProps> {
    mxObjectCustom?: Container.MxClick;
    trace?: T;
    mxForm: mxui.lib.form._FormBase;
    options: O;
  }

  export interface OnHoverOptions<
    T = any,
    O extends DataSourceProps = DataSourceProps
  > {
    mxObjectCustom?: Container.MxClick;
    options: O;
    tooltipForm: string;
    tooltipNode: HTMLDivElement;
    trace?: T;
  }

  export interface SeriesProps extends SeriesDataSourceProps, EventProps {
    name: string;
    seriesOptions: string;
    barColor: string;
    color?: string; // All serie barColor, lineColor, bubbleColor etc should be replaced with 'color'
    aggregationType: AggregationType;
  }

  export interface SeriesData<T extends SeriesProps = SeriesProps> {
    data?: mendix.lib.MxObject[];
    restData?: any;
    series: T;
  }

  export interface ScatterTrace {
    x: Datum[];
    y: Datum[];
    marker?: Partial<ScatterMarker>;
    r?: Datum[];
    theta?: Datum[];
  }

  export interface ReferencesSpec {
    attributes?: string[];
    amount?: number;
    sort?: [string, "desc" | "asc"][];
    references?: {
      [index: string]: ReferencesSpec;
    };
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
