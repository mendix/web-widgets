// Mock the IntersectionObserver, see https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
export class IntersectionObserver {
    root = null;
    rootMargin = "";
    thresholds = [];

    disconnect(): null {
        return null;
    }

    observe(): null {
        return null;
    }

    takeRecords(): [] {
        return [];
    }

    unobserve(): null {
        return null;
    }
}

export function setupIntersectionObserverStub(): void {
    window.IntersectionObserver = IntersectionObserver;
    globalThis.IntersectionObserver = IntersectionObserver;
}
