import { computed } from "mobx";

import { Data } from "plotly.js-dist-min";
import { EditableChartStore, EditableChartStoreProps } from "@mendix/shared-charts/main";
import { ComputedAtom, DerivedPropsGate, SetupHost } from "@mendix/widget-plugin-mobx-kit/main";
import { ChartPropsController } from "./ChartPropsController";
import { PlotlyController } from "./PlotlyController";
import { ResizeController } from "./ResizeController";
import { ControllerProps } from "./typings";
import { PlotlyChartProps } from "../components/PlotlyChart";

export class CustomChartControllerHost extends SetupHost {
    resizeCtrl: ResizeController;
    adapter: ChartPropsController;
    chartViewModel: PlotlyController;
    store: EditableChartStore;
    storePropsAtom: ComputedAtom<EditableChartStoreProps>;
    chartViewModelPropsAtom: ComputedAtom<PlotlyChartProps>;

    constructor(gate: DerivedPropsGate<ControllerProps>) {
        super();
        this.resizeCtrl = new ResizeController(this);
        this.adapter = new ChartPropsController(this, gate, this.resizeCtrl);
        this.storePropsAtom = storeAtom(this.adapter);
        this.store = new EditableChartStore(this, this.storePropsAtom);
        this.chartViewModelPropsAtom = viewModelAtom(this.store, this.adapter);
        this.chartViewModel = new PlotlyController(this.chartViewModelPropsAtom);
    }
}

function viewModelAtom(store: EditableChartStore, adapter: ChartPropsController): ComputedAtom<PlotlyChartProps> {
    return computed(() => {
        return {
            data: store.data as Data[],
            layout: store.layout,
            config: store.config,
            onClick: adapter.chartOnClick
        };
    });
}

function storeAtom(source: ChartPropsController): ComputedAtom<EditableChartStoreProps> {
    return computed(() => ({
        layout: source.layout,
        config: source.config,
        data: source.data
    }));
}
