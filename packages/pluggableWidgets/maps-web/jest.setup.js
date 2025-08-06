// Jest setup file to add polyfills for testing

// Polyfill for ResizeObserver which is required by Leaflet 2.0.0-alpha
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
}));
