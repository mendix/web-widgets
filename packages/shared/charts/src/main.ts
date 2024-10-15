export * from "./components/ChartWidget";
export * from "./utils/compareAttrValuesAsc";
export * from "./utils/equality";
export * from "./utils/configs";
export * from "./hooks/usePlotChartDataSeries";
import { usePlaygroundContext } from "./helpers/playground-context";
export { usePlaygroundContext };
export { fallback } from "./utils/json";
export type * from "./helpers/playground-context";
export type * from "./helpers/EditorStore";

// Rollup does "tree shaking" too well. This results
// in situation in which some exported members gets removed
// if they are not used by the widget.
// For example `usePlaygroundContext` is used only in
// Playground widget and removed in all other widgets
// when they build `charts-common` module.
// To prevent removal of some code on "tree shaking"
// we "lock" needed members as under this object.
export const USE_ONLY_TO_KEEP_EXPORTS = {
    usePlaygroundContext
} as const;
