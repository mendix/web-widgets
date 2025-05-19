import { attrId } from "@mendix/widget-plugin-test-utils";
import { configure, makeAutoObservable } from "mobx";
import { ObservableSortStore } from "../../ObservableSortStoreHost";
import { SortInstruction } from "../../SortingStoreInterface";
import { SortRecord, SortStoreHost } from "../SortStoreHost";

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

describe("SortStoreHost", () => {
    let host: SortStoreHost;

    beforeEach(() => {
        host = new SortStoreHost();
    });

    test("should initialize with empty state and sort order", () => {
        expect(host.sortOrder).toEqual([]);
        expect(host.state).toEqual([]);
    });

    test("should update store when host state changes", () => {
        const store = createObservableStore();
        host.observe(store, "test-key");

        // Update host state directly
        host.state = [{ key: "test-key", attrId: attrId("1"), dir: "asc" }];
        expect(store.sortOrder).toEqual(["attr_1", "asc"]);
    });

    test("should set store sortOrder to null when no matching record exists", () => {
        const store = createObservableStore();
        host.observe(store, "test-key");

        // First set it to a value
        host.state = [{ key: "test-key", attrId: attrId("1"), dir: "asc" }];
        expect(store.sortOrder).toEqual(["attr_1", "asc"]);

        // Then set host state to empty array
        host.state = [];
        expect(store.sortOrder).toBeNull();
    });

    test("should handle multiple stores with different keys", () => {
        const store1 = createObservableStore();
        const store2 = createObservableStore();

        host.observe(store1, "store1");
        host.observe(store2, "store2");

        host.state = [
            { key: "store1", attrId: attrId("1"), dir: "asc" },
            { key: "store2", attrId: attrId("2"), dir: "desc" }
        ];

        expect(store1.sortOrder).toEqual(["attr_1", "asc"]);
        expect(store2.sortOrder).toEqual(["attr_2", "desc"]);
    });

    test("should unobserve correctly", () => {
        const store = createObservableStore();
        host.observe(store, "test-key");

        // Set initial value
        host.state = [{ key: "test-key", attrId: attrId("1"), dir: "asc" }];
        expect(store.sortOrder).toEqual(["attr_1", "asc"]);

        // Unobserve
        host.unobserve(store);

        // Update state after unobserving
        host.state = [{ key: "test-key", attrId: attrId("2"), dir: "desc" }];

        // Store sortOrder should still be the previous value
        expect(store.sortOrder).toEqual(["attr_1", "asc"]);

        // State should still contain the record because unobserve doesn't affect it
        expect(host.state.length).toBe(1);
    });

    test("should do nothing when unobserving a non-existent store", () => {
        const store = createObservableStore();
        expect(() => {
            host.unobserve(store);
        }).not.toThrow();
    });

    // Test for the pending requirement: unobserving a store should remove record from state
    test("should remove record from state when unobserving a store", () => {
        const store1 = createObservableStore();
        const store2 = createObservableStore();

        host.observe(store1, "key1");
        host.observe(store2, "key2");

        // Set initial state with records for both stores
        host.state = [
            { key: "key1", attrId: attrId("1"), dir: "asc" },
            { key: "key2", attrId: attrId("2"), dir: "desc" }
        ];

        // Verify initial state contains both records
        expect(host.state.length).toBe(2);
        expect(host.state).toEqual([
            { key: "key1", attrId: attrId("1"), dir: "asc" },
            { key: "key2", attrId: attrId("2"), dir: "desc" }
        ]);

        // Unobserve the first store
        host.unobserve(store1);

        // Verify that the record associated with key1 has been removed from state
        expect(host.state.length).toBe(1);
        expect(host.state).toEqual([{ key: "key2", attrId: attrId("2"), dir: "desc" }]);

        // Unobserve the second store
        host.unobserve(store2);

        // Verify that the state is now empty
        expect(host.state.length).toBe(0);
        expect(host.state).toEqual([]);
    });

    describe("state manipulation", () => {
        test("should allow direct state manipulation", () => {
            // Setup stores
            const store1 = createObservableStore();
            const store2 = createObservableStore();

            host.observe(store1, "store1");
            host.observe(store2, "store2");

            // Set state directly
            const newState = [
                { key: "store1", attrId: attrId("1"), dir: "asc" },
                { key: "store2", attrId: attrId("2"), dir: "desc" }
            ] as SortRecord[];

            host.state = newState;

            // State should match what we set
            expect(host.state).toEqual(newState);

            // Stores should get their respective values
            expect(store1.sortOrder).toEqual(["attr_1", "asc"]);
            expect(store2.sortOrder).toEqual(["attr_2", "desc"]);

            // Modify just one record in the state
            host.state = [
                { key: "store1", attrId: attrId("3"), dir: "desc" },
                { key: "store2", attrId: attrId("2"), dir: "desc" }
            ];

            // Store1 should get the updated value
            expect(store1.sortOrder).toEqual(["attr_3", "desc"]);
            // Store2 should remain the same
            expect(store2.sortOrder).toEqual(["attr_2", "desc"]);
        });

        test("should clear all entries when state is set to empty array", () => {
            // Setup stores
            const store1 = createObservableStore();
            const store2 = createObservableStore();

            host.observe(store1, "store1");
            host.observe(store2, "store2");

            // Set state with values
            host.state = [
                { key: "store1", attrId: attrId("1"), dir: "asc" },
                { key: "store2", attrId: attrId("2"), dir: "desc" }
            ];

            // Verify stores received values
            expect(store1.sortOrder).toEqual(["attr_1", "asc"]);
            expect(store2.sortOrder).toEqual(["attr_2", "desc"]);

            // Now clear the state
            host.state = [];

            // State should be empty
            expect(host.state).toEqual([]);

            // Stores should have null sortOrder
            expect(store1.sortOrder).toBeNull();
            expect(store2.sortOrder).toBeNull();
        });
    });

    // Test specifically covering the state getter and setter that were added
    describe("state accessor methods", () => {
        test("getter returns a copy, not a direct reference to the internal state", () => {
            // Set up some initial state
            host.state = [{ key: "store1", attrId: attrId("1"), dir: "asc" }];

            // Get the state and modify it
            const stateCopy = host.state;
            stateCopy.push({ key: "store2", attrId: attrId("2"), dir: "desc" });

            // The internal state should NOT be affected (copy, not reference)
            expect(host.state).toEqual([{ key: "store1", attrId: attrId("1"), dir: "asc" }]);
        });

        test("setter should replace the entire state array", () => {
            // Set initial state
            host.state = [{ key: "store1", attrId: attrId("1"), dir: "asc" }];

            // Replace with new state
            host.state = [{ key: "store2", attrId: attrId("2"), dir: "desc" }];

            // State should be entirely replaced
            expect(host.state).toEqual([{ key: "store2", attrId: attrId("2"), dir: "desc" }]);
        });
    });

    // Test for the new _toSortInstruction and _toRecord methods
    describe("utility conversion methods", () => {
        test("should correctly convert between SortRecord and SortInstruction", () => {
            // We'll test these indirectly through the public API

            // Create a record through state setter
            host.state = [{ key: "test-key", attrId: "attr_1", dir: "asc" }];

            // Check that it's correctly converted to a SortInstruction
            expect(host.sortOrder).toEqual([["attr_1", "asc"]]);
        });
    });

    // The store to host reactivity works differently in the new implementation
    // and requires the state to already have a record with the key before updating it
    describe("state with stores reactivity", () => {
        test("should update existing state when store.sortOrder changes", () => {
            const store = createObservableStore();
            host.observe(store, "test-key");

            // First set state directly to create the record in the state
            host.state = [{ key: "test-key", attrId: attrId("1"), dir: "asc" }];
            expect(store.sortOrder).toEqual(["attr_1", "asc"]);

            // Then update through the store
            store.sortOrder = [attrId("2"), "desc"];

            // State should be updated with the new value
            expect(host.state).toEqual([{ key: "test-key", attrId: attrId("2"), dir: "desc" }]);
        });

        test("should remove record from state when store.sortOrder is set to null", () => {
            const store = createObservableStore();
            host.observe(store, "test-key");

            // First set state directly
            host.state = [{ key: "test-key", attrId: attrId("1"), dir: "asc" }];
            expect(store.sortOrder).toEqual(["attr_1", "asc"]);

            // Then set to null through the store
            store.sortOrder = null;

            // State should be empty
            expect(host.state).toEqual([]);
        });

        test("should provide immediate reactivity to a new store after observing", () => {
            // Set up state first
            host.state = [{ key: "test-key", attrId: attrId("1"), dir: "asc" }];

            // Then observe a store - it should immediately receive the value
            const store = createObservableStore();
            host.observe(store, "test-key");
            expect(store.sortOrder).toEqual(["attr_1", "asc"]);
        });

        test("should handle multiple stores observing with the same key", () => {
            const store1 = createObservableStore();
            const store2 = createObservableStore();

            // Observe two stores with the same key
            host.observe(store1, "same-key");
            host.observe(store2, "same-key");

            // Set initial state
            host.state = [{ key: "same-key", attrId: attrId("1"), dir: "asc" }];

            // Both stores should have the same value
            expect(store1.sortOrder).toEqual(["attr_1", "asc"]);
            expect(store2.sortOrder).toEqual(["attr_1", "asc"]);

            // Update through one store
            store1.sortOrder = [attrId("2"), "desc"];

            // Both stores and the state should be updated
            expect(store1.sortOrder).toEqual(["attr_2", "desc"]);
            expect(store2.sortOrder).toEqual(["attr_2", "desc"]);
            expect(host.state).toEqual([{ key: "same-key", attrId: attrId("2"), dir: "desc" }]);

            // Unobserve the first store
            host.unobserve(store1);

            // Update through the second store
            store2.sortOrder = [attrId("3"), "asc"];

            // Only store2 and state should be updated, store1 should remain unchanged
            expect(store2.sortOrder).toEqual(["attr_3", "asc"]);
            expect(host.state).toEqual([{ key: "same-key", attrId: attrId("3"), dir: "asc" }]);
            expect(store1.sortOrder).toEqual(["attr_2", "desc"]);
        });

        test("should handle adding a new store after state is already populated", () => {
            // Set up first store and populate state
            const store1 = createObservableStore();
            host.observe(store1, "key1");
            host.state = [
                { key: "key1", attrId: attrId("1"), dir: "asc" },
                { key: "key2", attrId: attrId("2"), dir: "desc" }
            ];

            // First store should have its value
            expect(store1.sortOrder).toEqual(["attr_1", "asc"]);

            // Add a second store observing a different key that already exists in state
            const store2 = createObservableStore();
            host.observe(store2, "key2");

            // Second store should immediately get its value from existing state
            expect(store2.sortOrder).toEqual(["attr_2", "desc"]);

            // Update state through a setter
            host.state = [
                { key: "key1", attrId: attrId("3"), dir: "desc" },
                { key: "key2", attrId: attrId("4"), dir: "asc" }
            ];

            // Both stores should be updated
            expect(store1.sortOrder).toEqual(["attr_3", "desc"]);
            expect(store2.sortOrder).toEqual(["attr_4", "asc"]);
        });
    });

    // New tests for state copy behavior
    describe("state copy behavior", () => {
        test("modifying returned state array does not affect internal state", () => {
            // Set initial state
            host.state = [{ key: "key1", attrId: attrId("1"), dir: "asc" }];

            // Get state and modify the copy
            const stateCopy = host.state;
            expect(Array.isArray(stateCopy)).toBe(true);

            // Verify it's a different array instance (using non-direct access)
            expect(stateCopy).not.toBe(host.state);

            // Modify the copy
            stateCopy.push({ key: "key2", attrId: attrId("2"), dir: "desc" });

            // Internal state should not be affected by modification to the copy
            expect(host.state).toEqual([{ key: "key1", attrId: attrId("1"), dir: "asc" }]);
            expect(host.state.length).toBe(1);

            // The modified copy should still have its changes
            expect(stateCopy.length).toBe(2);
            expect(stateCopy[1]).toEqual({ key: "key2", attrId: attrId("2"), dir: "desc" });
        });

        test("consecutive state operations maintain consistency", () => {
            // Set initial state
            host.state = [{ key: "key1", attrId: attrId("1"), dir: "asc" }];

            // Get a copy
            const firstCopy = host.state;

            // Modify the host state
            host.state = [{ key: "key1", attrId: attrId("2"), dir: "desc" }];

            // First copy should remain unchanged
            expect(firstCopy).toEqual([{ key: "key1", attrId: attrId("1"), dir: "asc" }]);

            // Get another copy
            const secondCopy = host.state;

            // Second copy should reflect latest state
            expect(secondCopy).toEqual([{ key: "key1", attrId: attrId("2"), dir: "desc" }]);

            // Modifying first copy should not affect host or second copy
            firstCopy.push({ key: "key2", attrId: attrId("3"), dir: "asc" });
            expect(host.state).toEqual([{ key: "key1", attrId: attrId("2"), dir: "desc" }]);
            expect(secondCopy).toEqual([{ key: "key1", attrId: attrId("2"), dir: "desc" }]);
        });
    });

    test("should handle edge cases correctly", () => {
        const store = createObservableStore();
        host.observe(store, "test-key");

        // Setting invalid state (shouldn't cause errors)
        host.state = [{ key: "test-key", attrId: "", dir: "asc" }];
        expect(store.sortOrder).toEqual(["", "asc"]);

        // Setting a state with duplicate keys (later ones should override)
        host.state = [
            { key: "test-key", attrId: attrId("1"), dir: "asc" },
            { key: "test-key", attrId: attrId("2"), dir: "desc" }
        ];

        // Only the first entry should be kept because the setter replaces the entire array
        // and the autorun finds the first matching record
        expect(host.state.length).toBe(1);
        expect(store.sortOrder).toEqual(["attr_2", "desc"]);

        // Re-add a record and check that changing direction works
        host.state = [{ key: "test-key", attrId: attrId("3"), dir: "asc" }];
        store.sortOrder = [attrId("3"), "desc"];
        expect(host.state).toEqual([{ key: "test-key", attrId: attrId("3"), dir: "desc" }]);
    });
});
