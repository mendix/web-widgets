type ObserverMock = { observe: () => void };
type IntersectionObserverMockType = () => ObserverMock;

const intersectionObserverMock: IntersectionObserverMockType = () => ({
    observe: () => null
});

window.IntersectionObserver = jest.fn().mockImplementation(intersectionObserverMock);
