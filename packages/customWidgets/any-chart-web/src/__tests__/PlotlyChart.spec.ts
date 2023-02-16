// import { createElement } from "react";
// import { mount, shallow } from "enzyme";

// import { getRandomNumbers } from "../utils/data";
// import { ScatterData } from "plotly.js";
// import * as Plotly from "../PlotlyCustom";

// import { ChartLoading } from "../components/ChartLoading";
// import { PlotlyChart, PlotlyChartProps } from "../components/PlotlyChart";

// describe("PlotlyChart", () => {
//     const renderShallowPlotlyChart = (props: PlotlyChartProps) => shallow(createElement(PlotlyChart, props));
//     const renderFullPlotlyChart = (props: PlotlyChartProps) => mount(createElement(PlotlyChart, props));
//     const defaultProps: PlotlyChartProps = {
//         type: "line",
//         layout: {
//             title: "My Chart",
//             showlegend: true
//         },
//         data: [
//             {
//                 x: [ "Sample 1", "Sample 2", "Sample 3", "Sample 4" ],
//                 y: getRandomNumbers(4, 100)
//             } as ScatterData
//         ],
//         config: { displayModeBar: false, doubleClick: false }
//     };

//     it("renders the structure correctly", () => {
//         const chart = renderShallowPlotlyChart(defaultProps);

//         expect(chart).toBeElement(
//             createElement("div", { className: "widget-charts widget-charts-line" },
//                 createElement("div", { className: "widget-charts-tooltip" }),
//                 createElement(ChartLoading)
//             )
//         );
//     });

//     xit("renders the chart", (done) => {
//         const renderChartSpy = spyOn(PlotlyChart.prototype, "renderChart" as any).and.callThrough();
//         const plotlySpy = spyOn(Plotly, "newPlot").and.callThrough();
//         renderFullPlotlyChart(defaultProps);

//         expect(renderChartSpy).toHaveBeenCalledWith(defaultProps);
//         window.setTimeout(() => {
//             expect(plotlySpy).toHaveBeenCalled();

//             done();
//         }, 1500);
//     });

//     it("re-renders the chart on update", () => {
//         const renderChartSpy = spyOn(PlotlyChart.prototype, "renderChart" as any).and.callThrough();
//         const chart = renderFullPlotlyChart(defaultProps);
//         chart.setProps({ onClick: jasmine.createSpy("onClick") });

//         expect(renderChartSpy).toHaveBeenCalledTimes(1);
//     });

//     xit("destroys the chart on unmount", (done) => {
//         const purgeSpy = spyOn(Plotly, "purge" as any).and.callThrough();
//         const chart = renderFullPlotlyChart(defaultProps);

//         window.setTimeout(() => {
//             chart.unmount();

//             expect(purgeSpy).toHaveBeenCalled();

//             done();
//         }, 500);
//     });

//     it("passes a reference of the tooltip node to the parent component", () => {
//         defaultProps.getTooltipNode = jasmine.createSpy("getTooltip");
//         renderFullPlotlyChart(defaultProps);

//         expect(defaultProps.getTooltipNode).toHaveBeenCalled();
//     });

//     it("hides the tooltip when a hover event is undone", () => {
//         // since we cannot simulate plotly unhover, we shall only test for the expected behaviour of the clearTooltip function
//         const chart = renderFullPlotlyChart(defaultProps);
//         const chartInstance: any = chart.instance();
//         chartInstance.tooltipNode.innerHTML = "I am a tooltip";
//         chartInstance.tooltipNode.style.opacity = "1";
//         chartInstance.clearTooltip();

//         expect(chartInstance.tooltipNode.style.opacity).toEqual("0");
//     });
// });
