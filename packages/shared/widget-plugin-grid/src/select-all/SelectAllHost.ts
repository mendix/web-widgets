import { BaseControllerHost } from "@mendix/widget-plugin-mobx-kit/BaseControllerHost";
import { disposeBatch } from "@mendix/widget-plugin-mobx-kit/disposeBatch";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { ListValue, SelectionMultiValue, SelectionSingleValue } from "mendix";
import { DatasourceController } from "../query/DatasourceController";
import { ProgressStore } from "../stores/ProgressStore";
import { SelectAllController } from "./SelectAllController";

interface DynamicProps {
    itemSelection?: SelectionMultiValue | SelectionSingleValue;
    datasource: ListValue;
}

export class SelectAllHost extends BaseControllerHost {
    readonly selectAllController: SelectAllController;

    constructor(
        gate: DerivedPropsGate<DynamicProps>,
        private readonly selectAllProgressStore: ProgressStore
    ) {
        super();
        const query = new DatasourceController(this, { gate });
        this.selectAllController = new SelectAllController(this, gate, query);
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
        const loadend = (): void => this.selectAllProgressStore.onloadend();
        const progress = (e: ProgressEvent): void => this.selectAllProgressStore.onprogress(e);

        controller.on("loadstart", loadstart);
        controller.on("loadend", loadend);
        controller.on("progress", progress);

        return () => {
            controller.off("loadstart", loadstart);
            controller.off("loadend", loadend);
            controller.off("progress", progress);
        };
    }
}
