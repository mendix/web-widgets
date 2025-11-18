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
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { Container, injected } from "brandi";
import { visibleColumnsCountAtom } from "../models/columns.model";
import { DatagridSetupService } from "../services/DatagridSetup.service";
import { TextsService } from "../services/Texts.service";
import { CORE_TOKENS as CORE } from "../tokens";

// datasource
injected(totalCountAtom, CORE.mainGate);
injected(itemCountAtom, CORE.mainGate);
injected(offsetAtom, CORE.mainGate);
injected(limitAtom, CORE.mainGate);
injected(hasMoreItemsAtom, CORE.mainGate);
injected(visibleColumnsCountAtom, CORE.columnsStore);
injected(isAllItemsPresentAtom, CORE.atoms.offset, CORE.atoms.hasMoreItems);

// selection
injected(
    isAllItemsSelectedAtom,
    CORE.selection.selectedCount,
    CORE.atoms.itemCount,
    CORE.atoms.totalCount,
    CORE.atoms.isAllItemsPresent
);
injected(isCurrentPageSelectedAtom, CORE.mainGate);
injected(selectedCountMultiAtom, CORE.mainGate);
injected(selectionCounterTextsStore, CORE.mainGate, CORE.selection.selectedCount);

// other
injected(TextsService, CORE.mainGate);

/**
 * Root container for bindings that can be shared down the hierarchy.
 * Declare only bindings that needs to be shared across multiple containers.
 * @remark Don't bind constants or directly prop-dependent values here. Prop-derived atoms/stores via dependency injection are acceptable.
 */
export class RootContainer extends Container {
    id = `DatagridRootContainer@${generateUUID()}`;

    constructor() {
        super();
        // The root setup host service
        this.bind(CORE.setupService).toInstance(DatagridSetupService).inSingletonScope();

        // datasource
        this.bind(CORE.atoms.hasMoreItems).toInstance(hasMoreItemsAtom).inTransientScope();
        this.bind(CORE.atoms.itemCount).toInstance(itemCountAtom).inTransientScope();
        this.bind(CORE.atoms.limit).toInstance(limitAtom).inTransientScope();
        this.bind(CORE.atoms.offset).toInstance(offsetAtom).inTransientScope();
        this.bind(CORE.atoms.totalCount).toInstance(totalCountAtom).inTransientScope();
        this.bind(CORE.atoms.visibleColumnsCount).toInstance(visibleColumnsCountAtom).inTransientScope();
        this.bind(CORE.atoms.isAllItemsPresent).toInstance(isAllItemsPresentAtom).inTransientScope();

        // selection
        this.bind(CORE.selection.selectedCount).toInstance(selectedCountMultiAtom).inTransientScope();
        this.bind(CORE.selection.isCurrentPageSelected).toInstance(isCurrentPageSelectedAtom).inTransientScope();
        this.bind(CORE.selection.selectedCounterTextsStore).toInstance(selectionCounterTextsStore).inTransientScope();
        this.bind(CORE.selection.isAllItemsSelected).toInstance(isAllItemsSelectedAtom).inTransientScope();
        this.bind(CORE.texts).toInstance(TextsService).inTransientScope();
    }
}
