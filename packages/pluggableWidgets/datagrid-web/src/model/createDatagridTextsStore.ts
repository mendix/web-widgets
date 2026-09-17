import { createTextsStore, DerivedTextsStore, OverrideMap } from "@mendix/widget-plugin-grid/main";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { Translations } from "../../typings/DatagridProps";
import { MainGateProps } from "../../typings/MainGateProps";

export const datagridOverrideMap = {
    loadMoreButtonCaption: "loadMoreButtonCaption",
    clearSelectionButtonLabel: "clearSelectionButtonLabel",
    selectedCountTemplateSingular: "selectedCountTemplateSingular",
    selectedCountTemplatePlural: "selectedCountTemplatePlural",
    selectAllText: "selectAllText",
    selectAllTemplate: "selectAllTemplate",
    allSelectedText: "allSelectedText"
} satisfies OverrideMap<MainGateProps, Translations>;

export type DatagridTextsStore = DerivedTextsStore<Translations>;

export function createDatagridTextsStore(gate: DerivedPropsGate<MainGateProps>): DatagridTextsStore {
    return createTextsStore<MainGateProps, Translations>(gate, datagridOverrideMap);
}
