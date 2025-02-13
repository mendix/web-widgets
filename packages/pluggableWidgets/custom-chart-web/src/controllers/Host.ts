import { BaseControllerHost } from "@mendix/widget-plugin-mobx-kit/BaseControllerHost";
import { ResizeController } from "./ResizeController";

export class Host extends BaseControllerHost {
    resizeCtrl: ResizeController;
    constructor() {
        super();
        this.resizeCtrl = new ResizeController(this);
    }
}
