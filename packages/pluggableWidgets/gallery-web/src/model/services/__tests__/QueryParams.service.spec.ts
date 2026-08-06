import { SetupComponentHost } from "@mendix/widget-plugin-mobx-kit/main";
import { attrId } from "@mendix/widget-plugin-test-utils";
import { ListAttributeId, SortInstruction } from "@mendix/widget-plugin-sorting/types/store";
import { FilterCondition } from "mendix/filters";
import { configure, observable, onReactionError } from "mobx";
import { QueryParamsService } from "../QueryParams.service";

const ATTR_A = attrId("a");
const ATTR_B = attrId("b");
const ATTR_STALE = attrId("kaf_3"); // gone after re-deploy

configure({ enforceActions: "never" });

/**
 * Minimal SetupComponentHost that collects and runs setups synchronously,
 * mirroring how the DI container drives services.
 */
function testHost(): { host: SetupComponentHost; start: () => () => void } {
    const components: Array<{ setup(): void | (() => void) }> = [];
    const host: SetupComponentHost = {
        add(component) {
            components.push(component);
        }
    } as SetupComponentHost;

    const start = (): (() => void) => {
        const disposers = components.map(c => c.setup()).filter(Boolean) as Array<() => void>;
        return () => disposers.forEach(d => d());
    };

    return { host, start };
}

/**
 * Query stub that mirrors the Mendix runtime: setSortOrder throws
 * `assertIsValidSortOrder`-style when handed an attribute id that is not
 * part of the current datasource's valid attribute set.
 */
function queryStub(validIds: ListAttributeId[]) {
    const applied: Array<SortInstruction[] | undefined> = [];
    return {
        applied,
        setSortOrder: jest.fn((order?: SortInstruction[]) => {
            for (const [id] of order ?? []) {
                if (!validIds.includes(id)) {
                    throw new Error(`Sort order item: invalid attribute id '${id}'`);
                }
            }
            applied.push(order);
        }),
        setFilter: jest.fn()
    } as any;
}

describe("QueryParamsService", () => {
    it("applies a valid sort order to the query", () => {
        const query = queryStub([ATTR_A, ATTR_B]);
        const sort = observable.object<{ sortOrder: SortInstruction[] | undefined }>({
            sortOrder: [[ATTR_A, "asc"]]
        });
        const filters = observable.object<{ filter: FilterCondition | undefined }>({ filter: undefined });

        const { host, start } = testHost();
        new QueryParamsService(host, query, filters, sort);
        const stop = start();

        expect(query.applied).toEqual([[[ATTR_A, "asc"]]]);
        stop();
    });

    // WC-3520: a stale attribute id (e.g. from runtime-restored datasource.sortOrder
    // after a re-deploy) must not crash the widget. The runtime throws inside the
    // sync reaction; mobx does not rethrow but routes it to onReactionError, which
    // surfaces as "[mobx] uncaught error in Reaction[Reaction]". Assert that hook
    // never fires.
    it("does not surface a reaction error when sort order contains a stale/invalid attribute id", () => {
        const query = queryStub([ATTR_A, ATTR_B]); // ATTR_STALE no longer valid
        const sort = observable.object<{ sortOrder: SortInstruction[] | undefined }>({
            sortOrder: [[ATTR_STALE, "asc"]]
        });
        const filters = observable.object<{ filter: FilterCondition | undefined }>({ filter: undefined });

        const reactionErrors: unknown[] = [];
        const disposeErrHook = onReactionError(err => reactionErrors.push(err));

        const { host, start } = testHost();
        new QueryParamsService(host, query, filters, sort);
        const stop = start();

        disposeErrHook();
        stop();
        expect(reactionErrors).toEqual([]);
    });

    it("recovers to default sort when an invalid id is encountered", () => {
        const query = queryStub([ATTR_A, ATTR_B]);
        const sort = observable.object<{ sortOrder: SortInstruction[] | undefined }>({
            sortOrder: [[ATTR_STALE, "asc"]]
        });
        const filters = observable.object<{ filter: FilterCondition | undefined }>({ filter: undefined });

        const { host, start } = testHost();
        new QueryParamsService(host, query, filters, sort);
        start();

        // Falls back to unsorted (undefined) so the datasource is still usable.
        expect(query.applied.at(-1)).toEqual(undefined);
    });
});
