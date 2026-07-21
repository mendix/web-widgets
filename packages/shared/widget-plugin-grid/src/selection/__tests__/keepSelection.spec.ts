import "../../utils/mobx-test-setup";
import { ObjectItem, SelectionMultiValue, SelectionSingleValue } from "mendix";
import { runInAction } from "mobx";
import { objectItems, SelectionMultiValueBuilder } from "@mendix/widget-plugin-test-utils";
import { MultiSelectionHelper, SingleSelectionHelper } from "../helpers";

type KeepSelectionPredicate = (item: ObjectItem) => boolean;

describe("keep selection vs clear selection", () => {
    describe("MultiSelectionHelper", () => {
        let builder: SelectionMultiValueBuilder;
        let selectionValue: SelectionMultiValue;
        let items: ObjectItem[];
        let helper: MultiSelectionHelper;
        let dispose: (() => void) | void;

        const predicate = (): KeepSelectionPredicate | undefined => builder.getKeepSelectionPredicate();

        // Simulates a datasource reconciliation: the runtime delivers a *new*
        // SelectionMultiValue ref (in-place `setSelection` does not change the
        // ref the helper observes). `updateProps` is how the helper sees it.
        function reconcile(next: ObjectItem[]): void {
            const nextValue = {
                type: "Multi",
                selection: next,
                setSelection: selectionValue.setSelection,
                setKeepSelection: selectionValue.setKeepSelection
            } as unknown as SelectionMultiValue;
            selectionValue = nextValue;
            runInAction(() => helper.updateProps(nextValue, items));
        }

        beforeEach(() => {
            items = objectItems(4);
            builder = new SelectionMultiValueBuilder();
            selectionValue = builder.build();
            helper = new MultiSelectionHelper(selectionValue, items, true);
            dispose = helper.setup();
        });

        afterEach(() => {
            dispose?.();
        });

        it("clear-beats-keep: clear empties selection and the keep predicate yields during the clear cycle", () => {
            reconcile([items[0], items[1]]);
            expect(selectionValue.selection).toHaveLength(2);
            // Keep is armed before clearing.
            expect(predicate()!(items[0])).toBe(true);

            helper.clearSelection();

            // setSelection([]) was issued and, at the moment of the reconciliation,
            // the keep predicate returns false so the runtime would not restore.
            expect(selectionValue.selection).toEqual([]);
            expect(predicate()!(items[0])).toBe(false);
        });

        it("keep-resumes-after-clear: keep re-arms once the empty selection is observed", () => {
            reconcile([items[0], items[1]]);
            helper.clearSelection();
            expect(predicate()!(items[0])).toBe(false);

            // The runtime delivers the empty selection (the clear landed).
            reconcile([]);

            expect(predicate()!(items[0])).toBe(true);
        });

        it("rearm-on-reselect: keep re-arms even if a new selection lands before the empty does", () => {
            reconcile([items[0], items[1]]);
            helper.clearSelection();
            expect(predicate()!(items[0])).toBe(false);

            // The user re-selects a different item before the empty reconciliation
            // ever arrives; the next reconciliation delivers a non-empty selection.
            reconcile([items[2]]);

            expect(predicate()!(items[0])).toBe(true);
        });

        it("double-clear-reentrancy: two clears before the empty lands re-arm exactly once", () => {
            reconcile([items[0], items[1]]);

            helper.clearSelection();
            helper.clearSelection();
            expect(predicate()!(items[0])).toBe(false);

            reconcile([]);
            expect(predicate()!(items[0])).toBe(true);
        });

        it("clear-without-keep: no predicate installed when keep is disabled", () => {
            const b2 = new SelectionMultiValueBuilder();
            const sv2 = b2.build();
            const h2 = new MultiSelectionHelper(sv2, items, false);
            const d2 = h2.setup();

            expect(b2.getKeepSelectionPredicate()).toBeUndefined();

            sv2.setSelection([items[0]]);
            h2.clearSelection();
            expect(sv2.selection).toEqual([]);

            d2?.();
        });

        it("dispose-mid-clear: pending re-arm watcher is cleaned up on teardown", () => {
            reconcile([items[0]]);
            helper.clearSelection();
            expect(predicate()!(items[0])).toBe(false);

            // Teardown before the empty selection is observed.
            dispose?.();
            dispose = undefined;

            // The empty reconciliation fires now, but the watcher is disposed,
            // so keep must stay off.
            reconcile([]);
            expect(predicate()!(items[0])).toBe(false);
        });

        it("predicate installed once: keep predicate is installed via setup(), not the constructor", () => {
            const b3 = new SelectionMultiValueBuilder();
            const sv3 = b3.build();
            const h3 = new MultiSelectionHelper(sv3, items, true);

            expect(b3.getKeepSelectionPredicate()).toBeUndefined();

            const d3 = h3.setup();
            expect(b3.getKeepSelectionPredicate()).toBeDefined();
            d3?.();
        });
    });

    describe("SingleSelectionHelper", () => {
        let selectionValue: SelectionSingleValue;
        let capturedPredicate: KeepSelectionPredicate | undefined;
        let items: ObjectItem[];
        let helper: SingleSelectionHelper;
        let dispose: (() => void) | void;

        function makeValue(selection: ObjectItem | undefined): SelectionSingleValue {
            const value = {
                type: "Single",
                selection,
                setSelection(next: ObjectItem | undefined) {
                    value.selection = next;
                },
                setKeepSelection(next: KeepSelectionPredicate | undefined) {
                    capturedPredicate = next;
                }
            };
            return value as unknown as SelectionSingleValue;
        }

        function reconcile(next: ObjectItem | undefined): void {
            selectionValue = makeValue(next);
            runInAction(() => helper.updateProps(selectionValue));
        }

        beforeEach(() => {
            items = objectItems(4);
            capturedPredicate = undefined;
            selectionValue = makeValue(undefined);
            helper = new SingleSelectionHelper(selectionValue, true);
            dispose = helper.setup();
        });

        afterEach(() => {
            dispose?.();
        });

        it("clear-beats-keep: remove empties single selection and the keep predicate yields", () => {
            reconcile(items[0]);
            expect(capturedPredicate!(items[0])).toBe(true);

            helper.remove();

            expect(selectionValue.selection).toBeUndefined();
            expect(capturedPredicate!(items[0])).toBe(false);
        });

        it("keep-resumes-after-clear: keep re-arms once the empty selection is observed", () => {
            reconcile(items[0]);
            helper.remove();
            expect(capturedPredicate!(items[0])).toBe(false);

            reconcile(undefined);
            expect(capturedPredicate!(items[0])).toBe(true);
        });
    });
});
