const intersectionObserverMock = () => ({
    observe: () => null
});
window.IntersectionObserver = jest.fn().mockImplementation(intersectionObserverMock);
