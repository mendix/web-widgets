import { ReactiveController } from "@mendix/widget-plugin-mobx-kit/main";
import { debounce } from "@mendix/widget-plugin-platform/utils/debounce";
import { makeObservable, observable } from "mobx";
import { Config, Data, Layout } from "plotly.js-dist-min";
import { CustomChartContainerProps } from "../../typings/CustomChartProps";
import { ChartProps, PlotlyChart } from "../components/PlotlyChart";
import { parseConfig, parseData, parseLayout } from "../utils/utils";
import { CustomChartControllerHost } from "./CustomChartControllerHost";
import { ResizeController } from "./ResizeController";

export class ChartController implements ReactiveController {
    private cleanup: undefined | (() => void) = undefined;
    private configurationOptions: string;
    private dataAttribute?: string;
    private dataStatic: string;
    private layoutAttribute?: string;
    private layoutStatic: string;
    private sampleData: string;
    private sampleLayout: string;
    private chart: PlotlyChart | null;

    constructor(host: CustomChartControllerHost, props: CustomChartContainerProps) {
        host.addController(this);

        this.configurationOptions = props.configurationOptions;
        this.dataAttribute = props.dataAttribute?.value;
        this.dataStatic = props.dataStatic;
        this.layoutAttribute = props.layoutAttribute?.value;
        this.layoutStatic = props.layoutStatic;
        this.sampleData = props.sampleData;
        this.sampleLayout = props.sampleLayout;
        this.chart = null;

        makeObservable<
            ChartController,
            | "configurationOptions"
            | "dataAttribute"
            | "dataStatic"
            | "layoutAttribute"
            | "layoutStatic"
            | "sampleData"
            | "sampleLayout"
        >(this, {
            configurationOptions: observable,
            dataAttribute: observable,
            dataStatic: observable,
            layoutAttribute: observable,
            layoutStatic: observable,
            sampleData: observable,
            sampleLayout: observable
        });
    }

    setup(): () => void {
        return () => this.cleanup?.();
    }

    getChartData(onClick: (data: any) => void, resizeController: ResizeController): ChartProps {
        const layout = this.getLayout();
        return {
            config: {
                ...this.getConfig(),
                responsive: true
            },
            data: this.getData(),
            layout: {
                ...layout,
                width: resizeController.width,
                height: resizeController.height,
                autosize: true,
                font: {
                    family: "Open Sans, sans-serif",
                    size: Math.max(12 * (resizeController.width / 1000), 8)
                },
                legend: {
                    ...layout.legend,
                    font: {
                        ...layout.legend?.font,
                        size: Math.max(10 * (resizeController.width / 1000), 7)
                    },
                    itemwidth: Math.max(10 * (resizeController.width / 1000), 3),
                    itemsizing: "constant"
                },
                xaxis: {
                    ...layout.xaxis,
                    tickfont: {
                        ...layout.xaxis?.tickfont,
                        size: Math.max(10 * (resizeController.width / 1000), 7)
                    }
                },
                yaxis: {
                    ...layout.yaxis,
                    tickfont: {
                        ...layout.yaxis?.tickfont,
                        size: Math.max(10 * (resizeController.width / 1000), 7)
                    }
                },
                margin: {
                    ...layout.margin,
                    l: Math.max(50 * (resizeController.width / 1000), 30),
                    r: Math.max(50 * (resizeController.width / 1000), 30),
                    t: Math.max(50 * (resizeController.width / 1000), 30),
                    b: Math.max(50 * (resizeController.width / 1000), 30),
                    pad: Math.max(4 * (resizeController.width / 1000), 2)
                }
            },
            onClick,

            width: resizeController.width,
            height: resizeController.height
        };
    }

    getConfig(): Partial<Config> {
        return parseConfig(this.configurationOptions);
    }

    getData(): Data[] {
        return parseData(this.dataStatic, this.dataAttribute, this.sampleData);
    }

    getLayout(): Partial<Layout> {
        return parseLayout(this.layoutStatic, this.layoutAttribute, this.sampleLayout);
    }

    setChart(target: HTMLDivElement, props: ChartProps): void {
        const [setChartDebounced, abort] = debounce(() => {
            if (!this.chart) {
                this.chart = new PlotlyChart(target, props);
            } else {
                this.chart.update(props);
            }
        }, 100);

        setChartDebounced();

        this.cleanup = () => {
            abort();
        };
    }
}
