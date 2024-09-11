import { CSSProperties, Component, createElement } from "react";
import { MapDispatchToProps, connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as classNames from "classnames";
import * as deepMerge from "deepmerge";

import { ChartLoading } from "./ChartLoading";
import { Data, PieHoverData, ScatterHoverData } from "plotly.js";
import * as PlotlyChartActions from "./actions/PlotlyChartActions";
import { Plotly, PlotlyChartInstance } from "./reducers/PlotlyChartReducer";
import ReactResizeDetector from "react-resize-detector";
import { getDimensionsFromNode } from "../utils/style";

const aggregateLib = require("plotly.js/lib/aggregate"); // tslint:disable-line

export interface ComponentProps {
    widgetID: string;
    type: "line" | "bar" | "pie" | "heatmap" | "full" | "polar";
    className?: string;
    style?: CSSProperties;
    onClick?: (data: ScatterHoverData<any> | PieHoverData) => void;
    onHover?: (data: ScatterHoverData<any> | PieHoverData) => void;
    onRestyle?: (data: any) => void;
    getTooltipNode?: (node: HTMLDivElement) => void;
    onRender?: (node: HTMLDivElement) => void;
    onResize?: (node: HTMLDivElement) => void;
}

declare global {
    interface Window {
        isHovered: boolean;
    }
}

window.isHovered = window.isHovered || false;

type PlotlyChartProps = ComponentProps & typeof PlotlyChartActions & PlotlyChartInstance;

class PlotlyChart extends Component<PlotlyChartProps, {}> {
    private chartNode?: HTMLDivElement;
    private tooltipNode?: HTMLDivElement;

    render() {
        return createElement(
            "div",
            {
                className: classNames(`widget-charts widget-charts-${this.props.type}`, this.props.className, {
                    loading: this.props.loadingData && !this.props.refresh
                }),
                style: this.props.style
            },
            this.renderChartNode(),
            createElement(ReactResizeDetector, { handleWidth: true, handleHeight: true, onResize: this.onResize }),
            createElement("div", { className: "widget-charts-tooltip", ref: this.getTooltipNodeRef }),
            this.renderLoadingIndicator()
        );
    }

    componentDidMount() {
        if (!this.props.loadingAPI && !this.props.plotly) {
            this.props.togglePlotlyAPILoading(this.props.widgetID, true, this.props.plotly);
        }
        this.fetchPlotly().then(plotly => {
            if (this.props.onRender && this.chartNode) {
                this.props.onRender(this.chartNode);
            }
            if (this.props.loadingAPI) {
                this.props.togglePlotlyAPILoading(this.props.widgetID, false, plotly);
            }
        });
    }

    componentDidUpdate() {
        if (!this.props.loadingAPI && !this.props.loadingData && this.props.plotly) {
            this.renderChart(this.props, this.props.plotly);
        }
    }

    componentWillUnmount() {
        if (this.chartNode && this.props.plotly) {
            this.props.plotly.purge(this.chartNode);
            this.props.clearInstanceState(this.props.widgetID);
        }
    }

    private renderChartNode() {
        return !this.props.loadingAPI ? createElement("div", { ref: this.getPlotlyNodeRef }) : null;
    }

    private renderLoadingIndicator() {
        return !this.props.refresh && (this.props.loadingAPI || this.props.loadingData)
            ? createElement(ChartLoading)
            : null;
    }

    private getPlotlyNodeRef = (node: HTMLDivElement) => {
        if (node) {
            this.chartNode = node;
        }
    };

    private getTooltipNodeRef = (node: HTMLDivElement) => {
        this.tooltipNode = node;
        if (this.props.getTooltipNode) {
            this.props.getTooltipNode(node);
        }
    };

    private renderChart({ config, data, layout, onClick, onHover, onRestyle }: PlotlyChartProps, plotly: Plotly) {
        const rootNode = this.chartNode && (this.chartNode.parentElement as HTMLDivElement);
        if (this.chartNode && rootNode && !this.props.loadingAPI && layout && data && Array.isArray(data) && config) {
            const layoutOptions = deepMerge.all([layout, getDimensionsFromNode(rootNode)]);
            const plotlyConfig = window.dojo && window.dojo.locale ? { ...config, locale: window.dojo.locale } : config;

            plotly.newPlot(this.chartNode, data as Data[], layoutOptions, plotlyConfig).then(myPlot => {
                if (onClick) {
                    myPlot.on("plotly_click", onClick as any);
                }
                if (onHover) {
                    myPlot.on("plotly_hover", onHover as any); // TODO: apply chat fix from the github issue
                }
                myPlot.on("plotly_unhover", this.clearTooltip);
                if (onRestyle) {
                    myPlot.on("plotly_restyle", onRestyle as any);
                }
            });
        }
    }

    private async fetchPlotly(): Promise<Plotly> {
        if (this.props.type === "full") {
            const { newPlot, purge } = await import("plotly.js/dist/plotly");

            return { newPlot, purge };
        } else {
            const { newPlot, purge, register } = await import("../PlotlyCustom");
            if (this.props.type === "pie") {
                register([await import("plotly.js/lib/pie")]);
            }
            if (this.props.type === "bar" || this.props.type === "line") {
                register([aggregateLib, await import("plotly.js/lib/bar"), await import("plotly.js/lib/scatter")]);
            }
            if (this.props.type === "heatmap") {
                register([await import("plotly.js/lib/heatmap")]);
            }

            return { newPlot, purge };
        }
    }

    private clearTooltip = () => {
        if (this.tooltipNode) {
            this.tooltipNode.style.opacity = "0";
            window.isHovered = false;
        }
    };

    private onResize = () => {
        if (!this.props.loadingAPI && !this.props.loadingData) {
            if (this.props.plotly && this.chartNode) {
                this.renderChart(this.props, this.props.plotly);
                if (this.props.onResize) {
                    this.props.onResize(this.chartNode);
                }
            }
        }
    };
}

const mapDispatchToProps: MapDispatchToProps<typeof PlotlyChartActions, ComponentProps> = dispatch =>
    bindActionCreators(PlotlyChartActions, dispatch);
export default connect(null, mapDispatchToProps)(PlotlyChart);
