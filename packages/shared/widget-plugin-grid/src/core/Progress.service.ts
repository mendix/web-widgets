import { makeAutoObservable } from "mobx";
import { TaskProgressService } from "../interfaces/TaskProgressService";

export class ProgressService implements TaskProgressService {
    inProgress = false;
    /**
     * If `false`, then `ProgressStore.total` and
     * `ProgressStore.progress` has no meaningful value.
     */
    lengthComputable = false;
    loaded = 0;
    total = 0;
    constructor() {
        makeAutoObservable(this);
    }

    get percentage(): number {
        if (!this.lengthComputable || !this.inProgress || this.total <= 0) {
            return 0;
        }

        const percentage = (this.loaded / this.total) * 100;
        switch (true) {
            case isNaN(percentage):
                return 0;
            case isFinite(percentage):
                return percentage;
            default:
                return 0;
        }
    }

    onloadstart = (event: ProgressEvent): void => {
        this.inProgress = true;
        this.lengthComputable = event.lengthComputable;
        this.total = event.total;
        this.loaded = 0;
    };

    onprogress = (event: ProgressEvent): void => {
        this.loaded = event.loaded;
    };

    onloadend = (): void => {
        this.inProgress = false;
        this.lengthComputable = false;
        this.loaded = 0;
        this.total = 0;
    };
}
