import { action, makeAutoObservable } from "mobx";

export class PageSizeStore {
    pageSize: number;

    constructor(initSize = 0) {
        this.pageSize = initSize;
        makeAutoObservable(this, { setPageSize: action.bound });
    }

    setPageSize(size: number): void {
        this.pageSize = size;
    }
}
