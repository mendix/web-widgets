import { makeAutoObservable } from "mobx";
import { Config, Data, Layout } from "plotly.js-dist-min";
import { DerivedPropsGate, SetupComponent, SetupComponentHost } from "@mendix/widget-plugin-mobx-kit/main";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { ControllerProps } from "./typings";
import { PlotlyChartProps } from "../components/PlotlyChart";
import { parseConfig, parseData, parseLayout } from "../utils/utils";

interface SizeProvider {
    width: number;
    height: number;
}

export class ChartPropsController implements SetupComponent {
    private cleanup: undefined | (() => void) = undefined;

    constructor(
        host: SetupComponentHost,
        private gate: DerivedPropsGate<ControllerProps>,
        private sizeProvider: SizeProvider
    ) {
        host.add(this);

        makeAutoObservable<ChartPropsController>(this, { setup: false });
    }

    private get props(): ControllerProps {
        return this.gate.props;
    }

    private get configurationOptions(): string {
        return this.props.configurationOptions;
    }

    private get dataAttribute(): undefined | string {
        return this.props.dataAttribute?.value;
    }

    private get dataStatic(): string {
        return this.props.dataStatic;
    }

    private get layoutAttribute(): undefined | string {
        return this.props.layoutAttribute?.value;
    }

    private get layoutStatic(): string {
        return this.props.layoutStatic;
    }

    private get sampleData(): string {
        return this.props.sampleData;
    }

    private get sampleLayout(): string {
        return this.props.sampleLayout;
    }

    setup(): () => void {
        return () => this.cleanup?.();
    }

    get chartOnClick(): (data: any) => void {
        return (data: any): void => {
            if (this.props.eventDataAttribute && data.points && data.points.length > 0) {
                const point = data.points[0];
                if (point) {
                    const { curveNumber, pointNumber, pointIndex, x, y, z, lat, lon, location, pointNumbers } = point;

                    const eventData = {
                        // Common properties for all chart types
                        curveNumber,
                        pointNumber,
                        pointIndex,

                        // Coordinate values (Cartesian 2D, 3D)
                        x,
                        y,
                        z, // for 3D charts

                        // Map coordinates (geographic charts)
                        lat,
                        lon,
                        location,

                        // Histogram specific properties
                        pointNumbers
                    };

                    this.props.eventDataAttribute.setValue(JSON.stringify(eventData));
                }
            }
            executeAction(this.props.onClick);
        };
    }

    get chartProps(): PlotlyChartProps {
        return {
            config: this.config,
            data: this.data,
            layout: this.layout,
            onClick: this.chartOnClick
        };
    }

    get config(): Partial<Config> {
        return { displayModeBar: false, ...parseConfig(this.configurationOptions) };
    }

    get data(): Data[] {
        return parseData(this.dataStatic, this.dataAttribute, this.sampleData);
    }

    get layout(): Partial<Layout> {
        const { width, height } = this.sizeProvider;
        const parsed = parseLayout(this.layoutStatic, this.layoutAttribute, this.sampleLayout);
        const scale = (base: number, min: number): number => Math.max(base * (width / 1000), min);

        return {
            ...parsed,
            width,
            height,
            autosize: true,
            font: {
                family: "Open Sans, sans-serif",
                size: scale(12, 8),
                ...parsed.font
            },
            legend: {
                font: { size: scale(10, 7), ...parsed.legend?.font },
                itemwidth: scale(10, 3),
                itemsizing: "constant",
                ...parsed.legend
            },
            xaxis: {
                tickfont: { size: scale(10, 7), ...parsed.xaxis?.tickfont },
                ...parsed.xaxis
            },
            yaxis: {
                tickfont: { size: scale(10, 7), ...parsed.yaxis?.tickfont },
                ...parsed.yaxis
            },
            margin: { l: 60, r: 60, t: 60, b: 60, pad: 10, ...parsed.margin }
        };
    }
}
