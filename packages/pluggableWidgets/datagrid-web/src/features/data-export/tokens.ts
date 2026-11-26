import { token } from "brandi";
import { createInjectionHooks } from "brandi-react";
import type { TaskProgressService } from "@mendix/widget-plugin-grid/main";

export const DATA_EXPORT_TOKENS = {
    exportProgressService: token<TaskProgressService>("ExportProgressService")
};

export const [useExportProgressService] = createInjectionHooks(DATA_EXPORT_TOKENS.exportProgressService);
