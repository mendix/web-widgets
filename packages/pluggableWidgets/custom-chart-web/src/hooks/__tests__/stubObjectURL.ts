// The chart controller imports plotly, which calls URL.createObjectURL at load time.
// The pluggable-widgets-tools jest env (jsdom) doesn't implement it. Import this module
// BEFORE anything that pulls in plotly to stub it.
if (typeof window.URL.createObjectURL !== "function") {
    window.URL.createObjectURL = () => "";
}

export {};
