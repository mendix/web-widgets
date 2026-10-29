import { ListValue, ValueStatus } from "mendix";
import { action, makeObservable, observable } from "mobx";

export class LazyLoadProvider {
    private ds?: ListValue;
    private limit: number = 0;

    constructor() {
        makeObservable<this, "ds" | "limit">(this, {
            ds: observable.ref,
            limit: observable,
            updateProps: action,
            getLimit: action
        });
    }

    updateProps(ds: ListValue): void {
        this.limit = ds.limit;
        this.ds = ds;
    }

    setLimit(limit?: number): void {
        if (limit !== this.ds?.limit) {
            this.ds?.setLimit(limit);
        }
    }

    getLimit(limit: number, readOnly: boolean, status: ValueStatus, lazyLoading: boolean): number | undefined {
        if (status !== "available" || readOnly === true) {
            if (status === "loading" && lazyLoading) {
                return this.limit === Infinity || !this.limit ? 0 : this.limit;
            }
            return 0;
        }

        if (lazyLoading) {
            if (limit < this.limit) {
                return this.limit;
            }

            if (limit > this.limit) {
                this.limit = limit;
            }

            return limit;
        }

        return undefined;
    }
}
