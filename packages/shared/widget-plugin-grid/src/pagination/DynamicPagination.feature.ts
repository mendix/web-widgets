import { ComputedAtom, disposeBatch, SetupComponent, SetupComponentHost } from "@mendix/widget-plugin-mobx-kit/main";
import { autorun, reaction } from "mobx";
import { GridPageControl } from "../interfaces/GridPageControl";

export class DynamicPaginationFeature implements SetupComponent {
    id = "DynamicPaginationFeature";
    constructor(
        host: SetupComponentHost,
        private config: { dynamicPageSizeEnabled: boolean; dynamicPageEnabled: boolean },
        private dynamicPage: ComputedAtom<number>,
        private dynamicPageSize: ComputedAtom<number>,
        private totalCount: ComputedAtom<number>,
        private service: GridPageControl
    ) {
        host.add(this);
    }

    setup(): () => void {
        const [add, disposeAll] = disposeBatch();

        if (this.config.dynamicPageSizeEnabled) {
            add(
                reaction(
                    () => this.dynamicPageSize.get(),
                    pageSize => {
                        if (pageSize < 0) return;
                        this.service.setPageSize(pageSize);
                    },
                    { delay: 250 }
                )
            );
        }

        if (this.config.dynamicPageEnabled) {
            add(
                reaction(
                    () => this.dynamicPage.get(),
                    page => {
                        if (page < 0) return;
                        this.service.setPage(page);
                    },
                    { delay: 250 }
                )
            );
            add(
                autorun(() => {
                    this.service.setTotalCount(this.totalCount.get());
                })
            );
        }

        return disposeAll;
    }
}
