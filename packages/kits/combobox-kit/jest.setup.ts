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

// downshift checks in development that every getter of a hook in use is called and its ref applied,
// and only logs when it is not. The log is turned into a failure here; in the browser it floods the
// console on every render of the widget.
const error = console.error;
console.error = (...args: unknown[]): void => {
    if (typeof args[0] === "string" && args[0].startsWith("downshift:")) {
        throw new Error(args[0]);
    }
    error(...args);
};
