import { BaseControllerHost } from "@mendix/widget-plugin-mobx-kit/BaseControllerHost";
import { ResizeController } from "./ResizeController";
import { ChartController } from "./ChartController";
import { CustomChartContainerProps } from "../../typings/CustomChartProps";

export class CustomChartControllerHost extends BaseControllerHost {
    resizeCtrl: ResizeController;
    chartCtrl: ChartController;

    constructor(props: CustomChartContainerProps) {
        super();
        this.resizeCtrl = new ResizeController(this);
        this.chartCtrl = new ChartController(this, props);
    }
}
