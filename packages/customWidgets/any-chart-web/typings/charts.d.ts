declare module "plotly.js/lib/core" {
    export = Plotly;
}
declare module "plotly.js/lib/bar" {
    const Bar: any;

    export = Bar;
}
// TODO: write proper typings for these - not being used beyond registration, so can skip for now
declare module "plotly.js/lib/scatter" {
    const Scatter: any;

    export = Scatter;
}
declare module "plotly.js/lib/scatterpolar" {
    const ScatterPolar: any;

    export = ScatterPolar;
}
declare module "plotly.js/lib/pie" {
    const Pie: any;

    export = Pie;
}
declare module "plotly.js/lib/heatmap" {
    const HeatMap: any;

    export = HeatMap;
}
declare module "plotly.js/dist/plotly" {
    export = Plotly;
}

declare module "plotly.js/lib/aggregate" {
    const Aggregate: any;

    export = Aggregate;
}

declare module "*.json";
