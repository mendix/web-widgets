import { configure, makeAutoObservable } from "mobx";
import { ObservableSortStore } from "../../ObservableSortStoreHost";
import { SortInstruction } from "../../SortingStoreInterface";
import { SortStoreHost } from "../SortStoreHost";

// This disables strict mode for testing purposes
configure({
    enforceActions: "never"
});

// Helper to create a proper observable store
function createObservableStore(): ObservableSortStore {
    return makeAutoObservable({
        sortOrder: null as SortInstruction | null
    });
}

// This disables strict mode for testing purposes
configure({
    enforceActions: "never"
});

describe("SortStoreHost", () => {
    let host: SortStoreHost;

    beforeEach(() => {
        host = new SortStoreHost();
    });

    test("should initialize with empty stores and sort order", () => {
        expect(host.sortOrder).toEqual([]);
    });

    test("should update store when host sortOrder changes", () => {
        const store = createObservableStore();
        host.observe("test-key", store);

        host.sortOrder = [["attr1", "asc"]];
        expect(store.sortOrder).toEqual(["attr1", "asc"]);
    });

    test("should set store sortOrder to null when no matching instruction exists", () => {
        const store = createObservableStore();
        host.observe("test-key", store);

        // First set it to a value
        host.sortOrder = [["attr1", "asc"]];
        expect(store.sortOrder).toEqual(["attr1", "asc"]);

        // Then set host sortOrder to empty array
        host.sortOrder = [];
        expect(store.sortOrder).toBeNull();
    });

    test("should handle multiple stores with different keys", () => {
        const store1 = createObservableStore();
        const store2 = createObservableStore();

        host.observe("store1", store1);
        host.observe("store2", store2);

        host.sortOrder = [
            ["attr1", "asc"],
            ["attr2", "desc"]
        ];
        expect(store1.sortOrder).toEqual(["attr1", "asc"]);
        expect(store2.sortOrder).toEqual(["attr2", "desc"]);
    });

    test("should unobserve correctly", () => {
        const store = createObservableStore();
        host.observe("test-key", store);

        // Set initial value
        host.sortOrder = [["attr1", "asc"]];
        expect(store.sortOrder).toEqual(["attr1", "asc"]);

        // Unobserve
        host.unobserve("test-key");

        // Update sortOrder after unobserving
        host.sortOrder = [["attr2", "desc"]];

        // Store sortOrder should still be the previous value
        expect(store.sortOrder).toEqual(["attr1", "asc"]);
    });

    test("should do nothing when unobserving a non-existent key", () => {
        expect(() => {
            host.unobserve("non-existent-key");
        }).not.toThrow();
    });

    test("should replace previously observed store with the same key", () => {
        const store1 = createObservableStore();
        const store2 = createObservableStore();

        // Observe first store
        host.observe("test-key", store1);
        host.sortOrder = [["attr1", "asc"]];
        expect(store1.sortOrder).toEqual(["attr1", "asc"]);

        // Observe second store with same key
        host.observe("test-key", store2);

        // Second store should get the current sort instruction
        expect(store2.sortOrder).toEqual(["attr1", "asc"]);

        // First store should still have its value
        expect(store1.sortOrder).toEqual(["attr1", "asc"]);
    });

    // These tests target the reaction that updates host when store changes
    describe("store to host reactivity", () => {
        test("should update host sortOrder when store sortOrder changes", () => {
            const store = createObservableStore();
            host.observe("test-key", store);

            // Update store's sortOrder - should trigger reaction to update host
            store.sortOrder = ["attr1", "asc"];

            // Host should reflect the change
            expect(host.sortOrder).toEqual([["attr1", "asc"]]);

            // Update to a different value
            store.sortOrder = ["attr2", "desc"];
            expect(host.sortOrder).toEqual([["attr2", "desc"]]);
        });

        test("should update host when store sortOrder is set to null", () => {
            const store = createObservableStore();
            host.observe("test-key", store);

            // First set a value
            store.sortOrder = ["attr1", "asc"];
            expect(host.sortOrder).toEqual([["attr1", "asc"]]);

            // Then set to null - should remove from host sort order
            store.sortOrder = null;
            expect(host.sortOrder).toEqual([]);
        });

        test("should not update host for an unknown key", () => {
            const store = createObservableStore();

            // Set initial host sort order
            host.sortOrder = [["existing", "asc"]];

            // Manually call the reaction callback as if the key doesn't exist
            // We can test this indirectly by ensuring that updating an unobserved store
            // doesn't affect the host
            store.sortOrder = ["attr1", "asc"];

            // Host sort order should remain unchanged
            expect(host.sortOrder).toEqual([["existing", "asc"]]);
        });

        test("should handle edge case when key not in storeOrder", () => {
            // This test specifically targets lines 27-30
            const store = createObservableStore();
            host.observe("test-key", store);

            // Forcibly manipulate internal state to create inconsistent state
            // @ts-expect-error - accessing private property for testing
            const storeOrderRef = host._storeOrder;

            // First add a value so there's something in the sortOrder
            store.sortOrder = ["attr1", "asc"];
            expect(host.sortOrder).toEqual([["attr1", "asc"]]);

            // Now remove the key from storeOrder to force the early return branch
            const index = storeOrderRef.indexOf("test-key");
            if (index > -1) {
                storeOrderRef.splice(index, 1);
            }

            // Try to update the store, which should trigger the early return
            store.sortOrder = ["attr2", "desc"];

            // The host sortOrder should remain unchanged due to early return
            expect(host.sortOrder).toEqual([["attr1", "asc"]]);
        });

        test("should clear host sortOrder when multiple stores set to null", () => {
            // Create multiple observable stores
            const store1 = createObservableStore();
            const store2 = createObservableStore();
            const store3 = createObservableStore();

            // Observe all stores with different keys
            host.observe("store1", store1);
            host.observe("store2", store2);
            host.observe("store3", store3);

            // Set each store's sortOrder
            store1.sortOrder = ["attr1", "asc"];
            store2.sortOrder = ["attr2", "desc"];
            store3.sortOrder = ["attr3", "asc"];

            // Verify host has all sort instructions
            expect(host.sortOrder).toEqual([
                ["attr1", "asc"],
                ["attr2", "desc"],
                ["attr3", "asc"]
            ]);

            // Now set each store's sortOrder to null one by one
            store1.sortOrder = null;
            // After first store is null, host should have 2 remaining instructions
            expect(host.sortOrder).toEqual([
                ["attr2", "desc"],
                ["attr3", "asc"]
            ]);

            store2.sortOrder = null;
            // After second store is null, host should have 1 remaining instruction
            // The order is important here - the last non-null store's instruction will remain
            expect(host.sortOrder).toEqual([["attr3", "asc"]]);

            // Try setting to null again - should have no effect as it's already null
            store2.sortOrder = null;
            expect(host.sortOrder).toEqual([["attr3", "asc"]]);

            // Set the last store to null
            store3.sortOrder = null;
            // After all stores are null, host should have empty array
            expect(host.sortOrder).toEqual([]);
        });
    });
});
