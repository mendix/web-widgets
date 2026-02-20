import {
    hasMoreItemsAtom,
    isAllItemsPresentAtom,
    itemCountAtom,
    limitAtom,
    offsetAtom,
    totalCountAtom
} from "@mendix/widget-plugin-grid/core/models/datasource.model";
import {
    isAllItemsSelectedAtom,
    isCurrentPageSelectedAtom,
    selectedCountMultiAtom,
    selectionCounterTextsStore
} from "@mendix/widget-plugin-grid/core/models/selection.model";
import { PageSizeStore } from "@mendix/widget-plugin-grid/pagination/main";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { Container, injected } from "brandi";
import { GallerySetupService } from "../services/GallerySetup.service";
import { TextsService } from "../services/Texts.service";
import { CORE_TOKENS as CORE } from "../tokens";
interface BindingGroup {
    /** Runs during container constructor. Use this hook to add new binding to the container. */
    define?(container: Container): void;
    /** This method runs only once. Should be used to inject dependencies. */
    inject?(): void;
}

const _01_datasourceBindings: BindingGroup = {
    inject() {
        injected(hasMoreItemsAtom, CORE.mainGate);
        injected(itemCountAtom, CORE.mainGate);
        injected(limitAtom, CORE.mainGate);
        injected(offsetAtom, CORE.mainGate);
        injected(totalCountAtom, CORE.mainGate);
        injected(isAllItemsPresentAtom, CORE.data.offset, CORE.data.hasMoreItems);
        injected(selectedCountMultiAtom, CORE.mainGate);
        injected(selectionCounterTextsStore, CORE.mainGate, CORE.selection.selectedCount);
    },
    define(container: Container) {
        container.bind(CORE.data.hasMoreItems).toInstance(hasMoreItemsAtom).inTransientScope();
        container.bind(CORE.data.itemCount).toInstance(itemCountAtom).inTransientScope();
        container.bind(CORE.data.limit).toInstance(limitAtom).inTransientScope();
        container.bind(CORE.data.offset).toInstance(offsetAtom).inTransientScope();
        container.bind(CORE.data.totalCount).toInstance(totalCountAtom).inTransientScope();
        container.bind(CORE.data.isAllItemsPresent).toInstance(isAllItemsPresentAtom).inTransientScope();
        container.bind(CORE.selection.selectedCount).toInstance(selectedCountMultiAtom).inTransientScope();
    }
};

const _02_selectionBindings: BindingGroup = {
    define(container: Container) {
        container.bind(CORE.selection.selectedCount).toInstance(selectedCountMultiAtom).inTransientScope();
        container.bind(CORE.selection.isCurrentPageSelected).toInstance(isCurrentPageSelectedAtom).inTransientScope();
        container
            .bind(CORE.selection.selectedCounterTextsStore)
            .toInstance(selectionCounterTextsStore)
            .inTransientScope();
        container.bind(CORE.selection.isAllItemsSelected).toInstance(isAllItemsSelectedAtom).inTransientScope();
    }
};

const _03_paginationBindings: BindingGroup = {
    inject() {
        injected(PageSizeStore, CORE.initPageSize.optional);
    },
    define(container: Container) {
        container.bind(CORE.pageSizeStore).toInstance(PageSizeStore).inSingletonScope();
    }
};

const _04_textsBindings: BindingGroup = {
    define(container: Container) {
        container.bind(CORE.texts).toInstance(TextsService).inTransientScope();
    }
};

const groups = [_01_datasourceBindings, _02_selectionBindings, _03_paginationBindings, _04_textsBindings];

// Inject tokens from groups
for (const grp of groups) {
    grp.inject?.();
}

/**
 * Root container for bindings that can be shared down the hierarchy.
 * Declare only bindings that needs to be shared across multiple containers.
 * @remark Don't bind constants or directly prop-dependent values here.
 * Prop-derived atoms/stores via dependency injection are acceptable.
 */
export class RootContainer extends Container {
    id = `GalleryRootContainer@${generateUUID()}`;
    constructor() {
        super();

        // Setup service
        this.bind(CORE.setupService).toInstance(GallerySetupService).inSingletonScope();

        for (const grp of groups) {
            grp.define?.(this);
        }
    }
}
