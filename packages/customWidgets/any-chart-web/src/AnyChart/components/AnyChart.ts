
// tslint:disable no-console
import { Component, ReactChild, createElement } from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { MapDispatchToProps, MapStateToProps, connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as deepEqual from "deep-equal";

import { HoverTooltip } from "../../components/HoverTooltip";
import { Alert } from "../../components/Alert";
import { AnyChartDataHandlerProps } from "./AnyChartDataHandler";
import PlotlyChart from "../../components/PlotlyChart";
import * as PlotlyChartActions from "../../components/actions/PlotlyChartActions";
import { PlotlyChartInstance, defaultPlotlyInstanceState } from "../../components/reducers/PlotlyChartReducer";
import { getDimensions, getTooltipCoordinates, parseStyle, setTooltipPosition } from "../../utils/style";
import "../../ui/Charts.scss";

import { getConfigOptions, getData, getLayoutOptions } from "../utils/configs";
import { DefaultReduxStore } from "../../store";

// TODO improve typing by replace explicit any types

export interface AnyChartComponentProps extends AnyChartDataHandlerProps {
    alertMessage?: ReactChild;
    onClick?: (data: any) => void;
    onHover?: (data: any, node: HTMLDivElement) => void;
}
export type AnyChartProps = AnyChartComponentProps & typeof PlotlyChartActions & PlotlyChartInstance;

class AnyChart extends Component<AnyChartProps> {
    private tooltipNode?: HTMLDivElement;

    shouldComponentUpdate(nextProps: Readonly<AnyChartProps>): boolean {
        // TODO: this version of TypeScript and the types from @types/deep-equal are not compatible. As an interim solution, the compilation error is ignored. Either fix typings/deep-equal or upgrade TS.
        // @ts-ignore
        return !deepEqual(nextProps, this.props, { strict: true });
    }

    render() {
        if (this.props.alertMessage) {
            return createElement(Alert, { className: `widget-charts-any-alert` }, this.props.alertMessage);
        }

        return this.renderChart();
    }

    private renderChart() {
        return createElement(PlotlyChart, {
            data: getData(this.props),
            loadingAPI: this.props.loadingAPI,
            loadingData: this.props.fetchingData,
            refresh: false,
            layout: getLayoutOptions(this.props),
            config: getConfigOptions(this.props),
            plotly: this.props.plotly,
            widgetID: this.props.instanceID,
            type: "full",
            className: this.props.class,
            style: { ...getDimensions(this.props), ...parseStyle(this.props.style) },
            onClick: this.onClick,
            onHover: this.onHover,
            getTooltipNode: this.getTooltipNodeRef
        });
    }

    private onClick = ({ points }: any) => {
        if (this.props.onClick) {
            this.props.onClick(this.extractRelevantPointData(points));
        }
    }

    private onHover = ({ points, event }: any) => {
        if (event && this.tooltipNode) {
            const { y, z, text } = points[0];
            unmountComponentAtNode(this.tooltipNode);
            const coordinates = getTooltipCoordinates(event, this.tooltipNode);
            if (coordinates) {
                setTooltipPosition(this.tooltipNode, coordinates);
                if (this.props.onHover) {
                    this.props.onHover(this.extractRelevantPointData(points), this.tooltipNode);
                } else if (points[0].data.hoverinfo === "none") {
                    render(createElement(HoverTooltip, { text: z || text || y }), this.tooltipNode);
                } else {
                    this.tooltipNode.style.opacity = "0";
                }
            }
        }
    }

    private getTooltipNodeRef = (node: HTMLDivElement) => {
        this.tooltipNode = node;
    }

    private extractRelevantPointData(points: any[]): any[] {
        const excludedKeys = [ "fullData", "xaxis", "yaxis", "data" ];

        return points.map((point) => {
            const result: any = {};
            for (const key in point) {
                if (excludedKeys.indexOf(key) === -1 && point.hasOwnProperty(key)) {
                    result[key] = point[key];
                }
            }

            return result;
        });
    }
}

const mapStateToProps: MapStateToProps<PlotlyChartInstance, AnyChartComponentProps, DefaultReduxStore> = (state, props) =>
    state.plotly[props.instanceID] || defaultPlotlyInstanceState;
const mapDispatchToProps: MapDispatchToProps<typeof PlotlyChartActions, AnyChartComponentProps> =
    dispatch => bindActionCreators(PlotlyChartActions, dispatch);
export default connect(mapStateToProps, mapDispatchToProps)(AnyChart);
