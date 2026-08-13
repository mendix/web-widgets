// shared-charts' main barrel imports plotly, which calls URL.createObjectURL at load time.
// jsdom/happy-dom doesn't implement it. Import this module BEFORE the barrel to stub it.
if (typeof window.URL.createObjectURL !== "function") {
    window.URL.createObjectURL = () => "";
}

export {};
