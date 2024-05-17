// Mock the IntersectionObserver, see https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
export class IntersectionObserver {
    root = null;
    rootMargin = "";
    thresholds = [];

    disconnect() {
        return null;
    }

    observe() {
        return null;
    }

    takeRecords() {
        return [];
    }

    unobserve() {
        return null;
    }
}
window.IntersectionObserver = IntersectionObserver;
global.IntersectionObserver = IntersectionObserver;
