import { EditorStoreState } from "@mendix/shared-charts/main";
import { BaseControllerHost } from "@mendix/widget-plugin-mobx-kit/BaseControllerHost";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { ResizeController } from "./ResizeController";
import { ChartPropsController } from "./ChartPropsController";
import { ControllerProps } from "./typings";
import { PlotlyController } from "./PlotlyController";

interface CustomChartControllerHostSpec {
    propsGate: DerivedPropsGate<ControllerProps>;
    editorStateGate: DerivedPropsGate<EditorStoreState>;
}

export class CustomChartControllerHost extends BaseControllerHost {
    resizeCtrl: ResizeController;
    chartPropsController: ChartPropsController;
    plotlyController: PlotlyController;

    constructor(spec: CustomChartControllerHostSpec) {
        super();
        this.resizeCtrl = new ResizeController(this);
        this.chartPropsController = new ChartPropsController(this, {
            propsGate: spec.propsGate,
            sizeProvider: this.resizeCtrl,
            editorStateGate: spec.editorStateGate
        });
        this.plotlyController = new PlotlyController({ propsProvider: this.chartPropsController });
    }
}
