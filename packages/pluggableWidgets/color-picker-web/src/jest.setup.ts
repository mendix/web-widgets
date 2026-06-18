import "@testing-library/jest-dom";

const originalConsoleError = console.error.bind(console);
console.error = (...args: unknown[]): void => {
    // react-color@2.19.3 uses defaultProps on function components, deprecated in React 18.3.
    // These warnings are from the library, not our widget code.
    if (typeof args[0] === "string" && args[0].includes("Support for defaultProps will be removed")) {
        return;
    }
    originalConsoleError(...args);
};
