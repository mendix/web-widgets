import { EditorStoreState } from "@mendix/shared-charts/main";
import { DerivedPropsGate, ReactiveController, ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/main";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { makeAutoObservable } from "mobx";
import { Config, Data, Layout } from "plotly.js-dist-min";
import { ChartProps } from "../components/PlotlyChart";
import { mergeChartProps, parseConfig, parseData, parseLayout } from "../utils/utils";
import { ControllerProps } from "./typings";

interface SizeProvider {
    width: number;
    height: number;
}

interface ChartPropsControllerSpec {
    propsGate: DerivedPropsGate<ControllerProps>;
    sizeProvider: SizeProvider;
    editorStateGate: DerivedPropsGate<EditorStoreState>;
}

export class ChartPropsController implements ReactiveController {
    private cleanup: undefined | (() => void) = undefined;
    private editorStateGate: DerivedPropsGate<EditorStoreState>;
    private propsGate: DerivedPropsGate<ControllerProps>;
    private sizeProvider: SizeProvider;

    constructor(host: ReactiveControllerHost, spec: ChartPropsControllerSpec) {
        host.addController(this);

        this.editorStateGate = spec.editorStateGate;
        this.propsGate = spec.propsGate;
        this.sizeProvider = spec.sizeProvider;

        makeAutoObservable<ChartPropsController>(this, { setup: false });
    }

    private get props(): ControllerProps {
        return this.propsGate.props;
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

    private get chartConfig(): ChartProps["config"] {
        return {
            displayModeBar: false,
            ...this.config
        };
    }

    private get chartLayout(): ChartProps["layout"] {
        return {
            ...this.layout,
            width: this.sizeProvider.width,
            height: this.sizeProvider.height,
            autosize: true,
            font: {
                family: "Open Sans, sans-serif",
                size: Math.max(12 * (this.sizeProvider.width / 1000), 8),
                ...this.layout.font
            },
            legend: {
                font: {
                    size: Math.max(10 * (this.sizeProvider.width / 1000), 7),
                    ...this.layout.legend?.font
                },
                itemwidth: Math.max(10 * (this.sizeProvider.width / 1000), 3),
                itemsizing: "constant",
                ...this.layout.legend
            },
            xaxis: {
                tickfont: {
                    size: Math.max(10 * (this.sizeProvider.width / 1000), 7),
                    ...this.layout.xaxis?.tickfont
                },
                ...this.layout.xaxis
            },
            yaxis: {
                tickfont: {
                    size: Math.max(10 * (this.sizeProvider.width / 1000), 7),
                    ...this.layout.yaxis?.tickfont
                },
                ...this.layout.yaxis
            },
            margin: {
                l: 60,
                r: 60,
                t: 60,
                b: 60,
                pad: 10,
                ...this.layout.margin
            }
        };
    }

    private get chartOnClick(): (data: any) => void {
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

    get chartProps(): ChartProps {
        return {
            config: this.chartConfig,
            data: this.data,
            layout: this.chartLayout,
            onClick: this.chartOnClick,
            width: this.sizeProvider.width,
            height: this.sizeProvider.height
        };
    }

    get config(): Partial<Config> {
        return parseConfig(this.configurationOptions);
    }

    get data(): Data[] {
        return parseData(this.dataStatic, this.dataAttribute, this.sampleData);
    }

    get layout(): Partial<Layout> {
        return parseLayout(this.layoutStatic, this.layoutAttribute, this.sampleLayout);
    }

    get mergedProps(): ChartProps {
        const props = this.chartProps;
        const state = this.editorStateGate.props;
        return mergeChartProps(props, state);
    }
}
