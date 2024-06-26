import { makeAutoObservable } from "mobx";

export class ProgressStore {
    exporting = false;
    lengthComputable = false;
    loaded = 0;
    total = 0;
    constructor() {
        makeAutoObservable(this);
    }

    onloadstart = (event: ProgressEvent): void => {
        this.exporting = true;
        this.lengthComputable = event.lengthComputable;
        this.total = event.total;
        this.loaded = 0;
    };

    onprogress = (event: ProgressEvent): void => {
        this.loaded = event.loaded;
    };

    onloadend = (): void => {
        this.exporting = false;
        this.lengthComputable = false;
        this.loaded = 0;
        this.total = 0;
    };
}
