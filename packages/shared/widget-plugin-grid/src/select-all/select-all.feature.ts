import { ComputedAtom, disposeBatch, Emitter, SetupComponent } from "@mendix/widget-plugin-mobx-kit/main";

import {
    BarStore,
    SelectAllEvents,
    SelectService,
    setupBarStore,
    setupSelectService,
    setupVisibilityEvents
} from "./select-all.model";

export class SelectAllFeature implements SetupComponent {
    constructor(
        private emitter: Emitter<SelectAllEvents>,
        private service: SelectService,
        private store: BarStore,
        private isCurrentPageSelected: ComputedAtom<boolean>,
        private isAllSelected: ComputedAtom<boolean>
    ) {}

    setup(): () => void {
        const [add, disposeAll] = disposeBatch();

        add(setupBarStore(this.store, this.emitter));
        add(setupSelectService(this.service, this.emitter));
        add(setupVisibilityEvents(this.isCurrentPageSelected, this.isAllSelected, this.emitter));

        return disposeAll;
    }
}
