import { autoEffect } from "@mendix/widget-plugin-mobx-kit/autoEffect";
import { DerivedPropsGate, ReactiveController, ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/main";
import { ListValue } from "mendix";
import { action, computed, makeObservable, observable } from "mobx";

type PropsGate = DerivedPropsGate<{ datasource: ListValue }>;
type Spec = { delay: number; gate: PropsGate };

export class RefreshController implements ReactiveController {
    private gate: PropsGate;
    private readonly delay: number;
    private refreshing = false;

    constructor(host: ReactiveControllerHost, spec: Spec) {
        host.addController(this);
        this.gate = spec.gate;
        this.delay = Math.max(spec.delay, 0);

        makeObservable<this, "setRefreshing" | "updateRefreshing" | "refreshing">(this, {
            refreshing: observable,
            isRefreshing: computed,
            setRefreshing: action,
            updateRefreshing: action
        });
    }

    get isRefreshing(): boolean {
        return this.refreshing;
    }

    private get datasource(): ListValue {
        return this.gate.props.datasource;
    }

    setup(): (() => void) | void {
        if (this.delay <= 0) {
            return;
        }
        // Set timer every time we got new ds ref value
        // Avoid using any other reactive dependencies other then ds
        return autoEffect(() => {
            const cleanup = this.scheduleReload(this.datasource, this.delay);
            this.updateRefreshing();
            return cleanup;
        });
    }

    private scheduleReload(ds: ListValue, delay: number): () => void {
        const timerId = setTimeout(() => {
            this.setRefreshing(true);
            ds.reload();
        }, delay);
        return () => clearTimeout(timerId);
    }

    private setRefreshing(value: boolean): void {
        this.refreshing = value;
    }

    private updateRefreshing(): void {
        if (this.refreshing) {
            this.setRefreshing(this.datasource.status === "loading");
        }
    }
}
