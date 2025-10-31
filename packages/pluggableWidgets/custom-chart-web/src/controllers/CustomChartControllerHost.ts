import { EditorStoreState } from "@mendix/shared-charts/main";
import { DerivedPropsGate, SetupHost } from "@mendix/widget-plugin-mobx-kit/main";
import { ChartPropsController } from "./ChartPropsController";
import { PlotlyController } from "./PlotlyController";
import { ResizeController } from "./ResizeController";
import { ControllerProps } from "./typings";

interface CustomChartControllerHostSpec {
    propsGate: DerivedPropsGate<ControllerProps>;
    editorStateGate: DerivedPropsGate<EditorStoreState>;
}

export class CustomChartControllerHost extends SetupHost {
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
