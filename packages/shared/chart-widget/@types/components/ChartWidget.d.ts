import { ReactElement } from "react";
import { Dimensions } from "@mendix/pluggable-widgets-commons";
import { ChartTypeEnum, CustomLayoutProps } from "../utils/configs";
import { ChartProps } from "./Chart";
import "../ui/Chart.scss";
export interface ChartWidgetProps extends CustomLayoutProps, Dimensions, ChartProps {
    className: string;
    showSidebarEditor: boolean;
    type: ChartTypeEnum;
    enableThemeConfig: boolean;
}
export declare const ChartWidget: ({
    className,
    data,
    widthUnit,
    width,
    heightUnit,
    height,
    showLegend,
    xAxisLabel,
    yAxisLabel,
    gridLinesMode,
    showSidebarEditor,
    customLayout,
    customConfig,
    layoutOptions,
    configOptions,
    seriesOptions,
    type,
    enableThemeConfig
}: ChartWidgetProps) => ReactElement;
//# sourceMappingURL=ChartWidget.d.ts.map
