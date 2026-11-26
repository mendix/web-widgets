import { token } from "brandi";
import { createInjectionHooks } from "brandi-react";
import type { ObjectItem } from "mendix";
import type { PageSizeStore } from "@mendix/widget-plugin-grid/pagination/main";
import type { ComputedAtom, DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import type { DatagridConfig } from "./configs/Datagrid.config";
import type { DatagridSetupService } from "./services/DatagridSetup.service";
import type { TextsService } from "./services/Texts.service";
import type { MainGateProps } from "../../../typings/MainGateProps";

/** Tokens to resolve dependencies from the container. */

/** Core tokens shared across containers through root container. */
export const CORE_TOKENS = {
    atoms: {
        hasMoreItems: token<ComputedAtom<boolean | undefined>>("@computed:hasMoreItems"),
        itemCount: token<ComputedAtom<number>>("@computed:itemCount"),
        limit: token<ComputedAtom<number>>("@computed:limit"),
        offset: token<ComputedAtom<number>>("@computed:offset"),
        totalCount: token<ComputedAtom<number>>("@computed:totalCount"),
        visibleColumnsCount: token<ComputedAtom<number>>("@computed:visibleColumnsCount"),
        isAllItemsPresent: token<ComputedAtom<boolean>>("@computed:isAllItemsPresent"),
        columnCount: token<ComputedAtom<number>>("@computed:columnCount")
    },
    initPageSize: token<number>("@const:initialPageSize"),
    pageSizeStore: token<PageSizeStore>("@store:PageSizeStore"),
    rows: token<ComputedAtom<ObjectItem[]>>("@computed:rowsArray"),

    config: token<DatagridConfig>("DatagridConfig"),

    mainGate: token<DerivedPropsGate<MainGateProps>>("@gate:MainGate"),

    selection: {
        selectedCount: token<ComputedAtom<number>>("@computed:selectedCount"),
        isAllItemsSelected: token<ComputedAtom<boolean>>("@computed:isAllItemsSelected"),
        isCurrentPageSelected: token<ComputedAtom<boolean>>("@computed:isCurrentPageSelected"),
        selectedCounterTextsStore: token<{
            clearSelectionButtonLabel: string;
            selectedCountText: string;
        }>("@store:selectedCounterTextsStore")
    },

    setupService: token<DatagridSetupService>("DatagridSetupService"),

    texts: token<TextsService>("@srv:TextsService")
};

export const [useDatagridConfig] = createInjectionHooks(CORE_TOKENS.config);
export const [useMainGate] = createInjectionHooks(CORE_TOKENS.mainGate);
export const [useVisibleColumnsCount] = createInjectionHooks(CORE_TOKENS.atoms.visibleColumnsCount);
export const [useItemCount] = createInjectionHooks(CORE_TOKENS.atoms.itemCount);
export const [useTexts] = createInjectionHooks(CORE_TOKENS.texts);
export const [useRows] = createInjectionHooks(CORE_TOKENS.rows);
