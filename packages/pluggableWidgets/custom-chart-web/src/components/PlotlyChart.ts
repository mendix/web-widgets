import Plotly, { Config, Data, Layout, PlotlyHTMLElement } from "plotly.js-dist-min";
const { newPlot, purge, react } = Plotly;

export interface ChartProps {
    data: Data[];
    layout: Partial<Layout>;
    config: Partial<Config>;
    width: number;
    height: number;
    onClick?: (data: any) => void;
}

export class PlotlyChart {
    private element: HTMLElement;
    private plotlyElement?: PlotlyHTMLElement;
    private data: Data[];
    private layout: Partial<Layout>;
    private config: Partial<Config>;

    constructor(element: HTMLElement, props: ChartProps) {
        this.element = element;
        this.data = props.data;
        this.layout = props.layout;
        this.config = props.config;
        this.init(props);
    }

    private init(props: ChartProps): void {
        newPlot(this.element, this.data, this.layout, this.config)
            .then(plotlyElement => {
                this.plotlyElement = plotlyElement;
                if (props?.onClick) {
                    this.plotlyElement.on("plotly_click", props.onClick);
                }
            })
            .catch(error => {
                console.error("Error initializing chart:", error);
            });
    }

    update(props: Partial<ChartProps>): void {
        if (props.data) {
            this.data = props.data;
        }
        if (props.layout) {
            this.layout = props.layout;
        }
        if (props.config) {
            this.config = props.config;
        }
        this.redraw();
    }

    private redraw(): void {
        if (this.plotlyElement) {
            react(this.element, this.data, this.layout, this.config).catch(error => {
                console.error("Error updating chart:", error);
            });
        }
    }

    destroy(): void {
        if (this.plotlyElement) {
            purge(this.element);
            this.plotlyElement = undefined;
        }
    }
}
