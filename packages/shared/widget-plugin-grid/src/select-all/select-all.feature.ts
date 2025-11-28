import {
    ComputedAtom,
    disposeBatch,
    Emitter,
    SetupComponent,
    SetupComponentHost
} from "@mendix/widget-plugin-mobx-kit/main";

import { TaskProgressService } from "../main";
import {
    BarStore,
    SelectAllEvents,
    SelectService,
    setupBarStore,
    setupProgressService,
    setupSelectService,
    setupVisibilityEvents
} from "./select-all.model";

export class SelectAllFeature implements SetupComponent {
    constructor(
        host: SetupComponentHost,
        private emitter: Emitter<SelectAllEvents>,
        private service: SelectService,
        private store: BarStore,
        private progress: TaskProgressService,
        private isCurrentPageSelected: ComputedAtom<boolean>,
        private isAllSelected: ComputedAtom<boolean>
    ) {
        host.add(this);
    }

    setup(): () => void {
        const [add, disposeAll] = disposeBatch();

        add(setupBarStore(this.store, this.emitter));
        add(setupSelectService(this.service, this.emitter));
        add(setupVisibilityEvents(this.isCurrentPageSelected, this.isAllSelected, this.emitter));
        add(setupProgressService(this.progress, this.emitter));

        return disposeAll;
    }
}
