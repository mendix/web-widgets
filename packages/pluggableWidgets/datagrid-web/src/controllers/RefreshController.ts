import { autoEffect } from "@mendix/widget-plugin-mobx-kit/autoEffect";
import { ReactiveController, ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/main";
import { ListValue } from "mendix";
import { action, computed, makeObservable, observable } from "mobx";

export class RefreshController implements ReactiveController {
    private ds: ListValue;
    private readonly delay: number;
    private refreshing = false;

    constructor(host: ReactiveControllerHost, props: { datasource: ListValue; delay: number }) {
        host.addController(this);
        this.ds = props.datasource;
        this.delay = Math.max(props.delay, 0);

        makeObservable<this, "ds" | "setRefreshing" | "updateRefreshing" | "refreshing">(this, {
            ds: observable.ref,
            refreshing: observable,
            isRefreshing: computed,
            updateProps: action,
            setRefreshing: action,
            updateRefreshing: action
        });
    }

    setup(): (() => void) | void {
        if (this.delay <= 0) {
            return;
        }

        // Set timer every time we got new ds ref value
        // Avoid using any other reactive dependencies other then ds
        return autoEffect(() => {
            const cleanup = this.scheduleReload(this.ds, this.delay);
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
            this.setRefreshing(this.ds.status === "loading");
        }
    }

    updateProps(props: { datasource: ListValue }): void {
        this.ds = props.datasource;
    }

    get isRefreshing(): boolean {
        return this.refreshing;
    }
}
