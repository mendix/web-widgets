import { configure } from "mobx";

// Every observable mutation must go through an action. MobX only warns about violations, so the
// warning is turned into a failure here; in Studio Pro the same mistake shows up as stale UI.
configure({ enforceActions: "always" });

const warn = console.warn;
console.warn = (...args: unknown[]): void => {
    if (typeof args[0] === "string" && args[0].startsWith("[MobX]")) {
        throw new Error(args[0]);
    }
    warn(...args);
};
