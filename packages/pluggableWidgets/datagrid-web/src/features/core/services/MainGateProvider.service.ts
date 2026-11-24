import { ProgressService, TaskProgressService } from "@mendix/widget-plugin-grid/main";
import { GateProvider } from "@mendix/widget-plugin-mobx-kit/main";

export class MainGateProvider<T> extends GateProvider<T> {
    selectAllProgress: TaskProgressService;
    exportProgress: TaskProgressService;

    constructor(props: T) {
        super(props);
        this.selectAllProgress = new ProgressService();
        this.exportProgress = new ProgressService();
    }

    /**
     * @remark
     * To avoid unwanted UI rerenders, we block prop updates during the "select all" action or export.
     */
    setProps(props: T): void {
        if (this.exportProgress.inProgress) return;
        if (this.selectAllProgress.inProgress) return;

        super.setProps(props);
    }
}
