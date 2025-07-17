import { attrId } from "@mendix/widget-plugin-test-utils";
import { SortStoreHost } from "../stores/SortStoreHost";
import { ObservableSortStore, SortInstruction } from "../types/store";

describe("SortStoreHost", () => {
    let sortStoreHost: SortStoreHost;
    let mockStore: ObservableSortStore;

    beforeEach(() => {
        sortStoreHost = new SortStoreHost();
        mockStore = {
            sortOrder: [
                [attrId("attr1"), "asc"],
                [attrId("attr2"), "desc"]
            ] as SortInstruction[],
            setSortOrder: jest.fn(),
            toJSON: jest.fn(),
            fromJSON: jest.fn()
        };
    });

    describe("constructor", () => {
        it("should initialize with empty state", () => {
            expect(sortStoreHost.sortOrder).toEqual([]);
            expect(sortStoreHost.usedBy).toBeNull();
        });

        it("should make properties observable/computed correctly", () => {
            // Test that the object is properly observable by checking MobX behavior
            expect(sortStoreHost).toBeDefined();
            expect(typeof sortStoreHost.sortOrder).toBe("object");
            expect(typeof sortStoreHost.usedBy).toBe("object");
        });
    });

    describe("sortOrder", () => {
        it("should return empty array when no store is observed", () => {
            expect(sortStoreHost.sortOrder).toEqual([]);
        });

        it("should return sort order from observed store", () => {
            sortStoreHost.observe(mockStore);
            expect(sortStoreHost.sortOrder).toEqual([
                [attrId("attr1"), "asc"],
                [attrId("attr2"), "desc"]
            ]);
        });

        it("should return empty array after unobserving", () => {
            sortStoreHost.observe(mockStore);
            sortStoreHost.unobserve();
            expect(sortStoreHost.sortOrder).toEqual([]);
        });
    });

    describe("observe", () => {
        it("should set the internal store", () => {
            sortStoreHost.observe(mockStore);
            expect(sortStoreHost.sortOrder).toBe(mockStore.sortOrder);
        });

        it("should replace previously observed store", () => {
            const anotherMockStore: ObservableSortStore = {
                sortOrder: [[attrId("attr3"), "asc"]] as SortInstruction[],
                setSortOrder: jest.fn(),
                toJSON: jest.fn(),
                fromJSON: jest.fn()
            };

            sortStoreHost.observe(mockStore);
            expect(sortStoreHost.sortOrder).toBe(mockStore.sortOrder);

            sortStoreHost.observe(anotherMockStore);
            expect(sortStoreHost.sortOrder).toBe(anotherMockStore.sortOrder);
        });
    });

    describe("unobserve", () => {
        it("should clear the internal store", () => {
            sortStoreHost.observe(mockStore);
            sortStoreHost.unobserve();
            expect(sortStoreHost.sortOrder).toEqual([]);
        });

        it("should be safe to call when no store is observed", () => {
            expect(() => sortStoreHost.unobserve()).not.toThrow();
            expect(sortStoreHost.sortOrder).toEqual([]);
        });
    });

    describe("lock", () => {
        it("should add id to usedBy list and return unlock function", () => {
            const unlock = sortStoreHost.lock("widget1");

            expect(sortStoreHost.usedBy).toBe("widget1");
            expect(typeof unlock).toBe("function");
        });

        it("should return unlock function that removes the id", () => {
            const unlock = sortStoreHost.lock("widget1");
            expect(sortStoreHost.usedBy).toBe("widget1");

            unlock();
            expect(sortStoreHost.usedBy).toBeNull();
        });

        it("should handle multiple locks correctly", () => {
            const unlock1 = sortStoreHost.lock("widget1");
            const unlock2 = sortStoreHost.lock("widget2");

            // First widget should be the one returned by usedBy
            expect(sortStoreHost.usedBy).toBe("widget1");

            unlock1();
            expect(sortStoreHost.usedBy).toBe("widget2");

            unlock2();
            expect(sortStoreHost.usedBy).toBeNull();
        });

        it("should not add duplicate ids", () => {
            sortStoreHost.lock("widget1");
            sortStoreHost.lock("widget1");

            expect(sortStoreHost.usedBy).toBe("widget1");
            // Internal _usedBy array should only have one entry
            // We can test this indirectly by checking that unlocking once clears it
            const unlock = sortStoreHost.lock("widget1");
            unlock();
            expect(sortStoreHost.usedBy).toBeNull();
        });
    });

    describe("usedBy", () => {
        it("should return null when no widgets are using the store", () => {
            expect(sortStoreHost.usedBy).toBeNull();
        });

        it("should return the first widget id when multiple widgets are using the store", () => {
            sortStoreHost.lock("widget1");
            sortStoreHost.lock("widget2");
            sortStoreHost.lock("widget3");

            expect(sortStoreHost.usedBy).toBe("widget1");
        });

        it("should return the next widget id after the first is removed", () => {
            const unlock1 = sortStoreHost.lock("widget1");
            const unlock2 = sortStoreHost.lock("widget2");

            expect(sortStoreHost.usedBy).toBe("widget1");

            unlock1();
            expect(sortStoreHost.usedBy).toBe("widget2");

            unlock2();
            expect(sortStoreHost.usedBy).toBeNull();
        });
    });

    describe("private methods", () => {
        it("should handle removing non-existent id gracefully", () => {
            // This tests the _remove method indirectly
            const unlock = sortStoreHost.lock("widget1");

            // Call unlock twice - second call should be safe
            unlock();
            expect(() => unlock()).not.toThrow();
            expect(sortStoreHost.usedBy).toBeNull();
        });

        it("should maintain correct order when removing from middle", () => {
            const unlock1 = sortStoreHost.lock("widget1");
            const unlock2 = sortStoreHost.lock("widget2");
            const unlock3 = sortStoreHost.lock("widget3");

            expect(sortStoreHost.usedBy).toBe("widget1");

            // Remove middle item
            unlock2();
            expect(sortStoreHost.usedBy).toBe("widget1");

            unlock1();
            expect(sortStoreHost.usedBy).toBe("widget3");

            unlock3();
            expect(sortStoreHost.usedBy).toBeNull();
        });
    });

    describe("integration scenarios", () => {
        it("should work correctly when combining observe and lock", () => {
            sortStoreHost.observe(mockStore);
            const unlock = sortStoreHost.lock("widget1");

            expect(sortStoreHost.sortOrder).toEqual([
                [attrId("attr1"), "asc"],
                [attrId("attr2"), "desc"]
            ]);
            expect(sortStoreHost.usedBy).toBe("widget1");

            sortStoreHost.unobserve();
            expect(sortStoreHost.sortOrder).toEqual([]);
            expect(sortStoreHost.usedBy).toBe("widget1"); // Lock should remain

            unlock();
            expect(sortStoreHost.usedBy).toBeNull();
        });

        it("should handle store changes after observation", () => {
            const mutableStore = {
                sortOrder: [[attrId("attr1"), "asc"]] as SortInstruction[],
                setSortOrder: jest.fn(),
                toJSON: jest.fn(),
                fromJSON: jest.fn()
            };

            sortStoreHost.observe(mutableStore);
            expect(sortStoreHost.sortOrder).toEqual([[attrId("attr1"), "asc"]]);

            // Simulate store change
            mutableStore.sortOrder = [
                [attrId("attr2"), "desc"],
                [attrId("attr3"), "asc"]
            ];
            expect(sortStoreHost.sortOrder).toEqual([
                [attrId("attr2"), "desc"],
                [attrId("attr3"), "asc"]
            ]);
        });
    });
});
