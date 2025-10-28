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
    useDatagridFilterAPI
] = createInjectionHooks(
    TOKENS.basicDate,
    TOKENS.paginationService,
    TOKENS.selectionCounter,
    TOKENS.loaderViewModel,
    TOKENS.columnsStore,
    TOKENS.exportProgressService,
    TOKENS.mainGate,
    TOKENS.staticInfo,
    TOKENS.filterAPI
);

export {
    useBasicData,
    useColumnsStore,
    useDatagridFilterAPI,
    useExportProgressService,
    useLoaderViewModel,
    useMainGate,
    usePaginationService,
    useSelectionCounterViewModel,
    useStaticInfo
};
