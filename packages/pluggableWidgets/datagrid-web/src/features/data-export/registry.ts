import { ExportController } from "./ExportController";

const REGISTRY_NAME = "com.mendix.widgets.web.datagrid.export";

type ExportRegistry = Map<string, ExportController>;

declare global {
    interface Window {
        [REGISTRY_NAME]: ExportRegistry;
    }
}

export function getExportRegistry(): ExportRegistry {
    return (window[REGISTRY_NAME] ??= new Map());
}
