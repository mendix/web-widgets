import { BaseControllerHost } from "@mendix/widget-plugin-mobx-kit/BaseControllerHost";
import { disposeBatch } from "@mendix/widget-plugin-mobx-kit/disposeBatch";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { ListValue, SelectionMultiValue, SelectionSingleValue } from "mendix";
import { DatasourceController } from "../query/DatasourceController";
import { ProgressStore } from "../stores/ProgressStore";
import { SelectAllController } from "./SelectAllController";

type SelectAllHostSpec = {
    gate: DerivedPropsGate<{ itemSelection?: SelectionMultiValue | SelectionSingleValue; datasource: ListValue }>;
    selectAllProgressStore: ProgressStore;
};

export class SelectAllHost extends BaseControllerHost {
    readonly selectAllController: SelectAllController;
    readonly selectAllProgressStore: ProgressStore;

    constructor(spec: SelectAllHostSpec) {
        super();
        const query = new DatasourceController(this, { gate: spec.gate });
        this.selectAllController = new SelectAllController(this, { gate: spec.gate, query, pageSize: 30 });
        this.selectAllProgressStore = spec.selectAllProgressStore;
    }

    setup(): () => void {
        const [add, disposeAll] = disposeBatch();

        add(super.setup());
        add(this.setupSelectAllProgressStore());

        return disposeAll;
    }

    private setupSelectAllProgressStore() {
        const controller = this.selectAllController;
        const loadstart = (e: ProgressEvent): void => this.selectAllProgressStore.onloadstart(e);
        const loadend = (e: ProgressEvent): void => this.selectAllProgressStore.onloadstart(e);
        const progress = (e: ProgressEvent): void => this.selectAllProgressStore.onprogress(e);

        controller.addEventListener("loadstart", loadstart);
        controller.addEventListener("loadend", loadend);
        controller.addEventListener("abort", loadend);
        controller.addEventListener("progress", progress);

        return () => {
            controller.removeEventListener("loadstart", loadstart);
            controller.removeEventListener("loadend", loadend);
            controller.removeEventListener("abort", loadend);
            controller.removeEventListener("progress", progress);
        };
    }
}
