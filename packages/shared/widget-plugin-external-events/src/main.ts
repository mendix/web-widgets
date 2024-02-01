export { requirePlugin } from "./plugin.js";
export * from "./hooks.js";

export const recommendedEventNames = {
    input: {
        clear: "clear.value"
    },
    grid: {
        resetFilters: "reset.filters"
    }
};
