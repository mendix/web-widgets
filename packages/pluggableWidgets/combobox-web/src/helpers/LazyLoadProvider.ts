import { ListValue, ValueStatus } from "mendix";

export class LazyLoadProvider {
    private ds?: ListValue;
    private limit: number = 0;

    constructor() {}

    updateProps(ds: ListValue) {
        this.limit = ds.limit;
        this.ds = ds;
    }

    setLimit(limit?: number) {
        if (limit !== this.ds?.limit) {
            this.ds?.setLimit(limit);
        }
    }

    getLimit(limit: number, readOnly: boolean, status: ValueStatus, lazyLoading: boolean): number | undefined {
        if (status !== "available" || readOnly === true) {
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
