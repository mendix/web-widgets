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
