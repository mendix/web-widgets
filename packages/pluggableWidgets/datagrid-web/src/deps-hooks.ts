import { createInjectionHooks } from "brandi-react";
import { TOKENS } from "./Datagrid.depsContainer";

const [
    useBasicData,
    usePaginationService,
    useSelectionCounterViewModel,
    useLoaderViewModel,
    useColumnsStore,
    useExportProgressService,
    useMainGate,
    useStaticInfo,
    useDatagridFilterAPI,
    useSelectAllBarViewModel,
    useSelectionDialogViewModel
] = createInjectionHooks(
    TOKENS.basicDate,
    TOKENS.paginationService,
    TOKENS.selectionCounter,
    TOKENS.loaderViewModel,
    TOKENS.columnsStore,
    TOKENS.exportProgressService,
    TOKENS.mainGate,
    TOKENS.staticInfo,
    TOKENS.filterAPI,
    TOKENS.selectAllBar,
    TOKENS.selectionDialogViewModel
);

export {
    useBasicData,
    useColumnsStore,
    useDatagridFilterAPI,
    useExportProgressService,
    useLoaderViewModel,
    useMainGate,
    usePaginationService,
    useSelectAllBarViewModel,
    useSelectionCounterViewModel,
    useSelectionDialogViewModel,
    useStaticInfo
};
