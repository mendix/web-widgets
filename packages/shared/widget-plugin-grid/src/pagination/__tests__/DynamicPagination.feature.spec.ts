import {
    ComputedAtom,
    DerivedPropsGate,
    SetupComponent,
    SetupComponentHost
} from "@mendix/widget-plugin-mobx-kit/main";
import { EditableValueBuilder } from "@mendix/widget-plugin-test-utils";
import { Big } from "big.js";
import { action, computed, makeObservable, observable, runInAction } from "mobx";
import { EditableValue } from "mendix";
import { GridPageControl } from "../../interfaces/GridPageControl";
import { DynamicPaginationFeature } from "../DynamicPagination.feature";

type GateProps = {
    dynamicPage?: EditableValue<Big>;
    dynamicPageSize?: EditableValue<Big>;
    totalCountValue?: EditableValue<Big>;
    loadedRowsValue?: EditableValue<Big>;
};

function lastArgToNumber(mockFn: jest.MockedFunction<any>): number {
    const calls = mockFn.mock.calls;
    return calls[calls.length - 1][0].toNumber();
}

type NumberAtomBox = {
    atom: ComputedAtom<number>;
    set: (value: number) => void;
};

function boxAtom(initial: number): NumberAtomBox {
    const box = observable.box(initial);
    return {
        atom: computed(() => box.get()) as ComputedAtom<number>,
        set: value => box.set(value)
    };
}

function makeHost(): SetupComponentHost {
    return {
        add: (_component: SetupComponent) => {},
        remove: (_component: SetupComponent) => {},
        setup: () => () => {}
    } as SetupComponentHost;
}

class ObservableGate<T extends object> implements DerivedPropsGate<T> {
    props: T;
    constructor(initialProps: T) {
        this.props = initialProps;
        makeObservable(this, { props: observable.ref, setProps: action });
    }
    setProps(props: T): void {
        this.props = props;
    }
}

describe("DynamicPaginationFeature", () => {
    let service: jest.Mocked<GridPageControl>;
    let gate: ObservableGate<GateProps>;
    let atoms: {
        dynamicPage: NumberAtomBox;
        dynamicPageSize: NumberAtomBox;
        totalCount: NumberAtomBox;
        currentPage: NumberAtomBox;
        pageSize: NumberAtomBox;
        loadedRows: NumberAtomBox;
    };
    let pageAttr: EditableValue<Big>;
    let pageSizeAttr: EditableValue<Big>;
    let totalCountAttr: EditableValue<Big>;
    let loadedRowsAttr: EditableValue<Big>;
    let dispose: () => void;

    beforeEach(() => {
        jest.useFakeTimers();

        service = {
            setPage: jest.fn(),
            setPageSize: jest.fn(),
            setTotalCount: jest.fn(),
            setLoadedRows: jest.fn()
        };

        pageAttr = new EditableValueBuilder<Big>().build();
        pageSizeAttr = new EditableValueBuilder<Big>().build();
        totalCountAttr = new EditableValueBuilder<Big>().build();
        loadedRowsAttr = new EditableValueBuilder<Big>().build();

        gate = new ObservableGate({
            dynamicPage: pageAttr,
            dynamicPageSize: pageSizeAttr,
            totalCountValue: totalCountAttr,
            loadedRowsValue: loadedRowsAttr
        });

        atoms = {
            dynamicPage: boxAtom(-1),
            dynamicPageSize: boxAtom(-1),
            totalCount: boxAtom(0),
            currentPage: boxAtom(0),
            pageSize: boxAtom(10),
            loadedRows: boxAtom(0)
        };

        const feature = new DynamicPaginationFeature(
            makeHost(),
            { dynamicPageEnabled: true, dynamicPageSizeEnabled: true, isLimitBased: false },
            atoms.dynamicPage.atom,
            atoms.dynamicPageSize.atom,
            atoms.totalCount.atom,
            atoms.currentPage.atom,
            atoms.pageSize.atom,
            atoms.loadedRows.atom,
            gate,
            service
        );

        dispose = feature.setup();
    });

    afterEach(() => {
        dispose();
        jest.useRealTimers();
    });

    it("syncs inbound attribute values to page control service", () => {
        runInAction(() => atoms.dynamicPageSize.set(5));
        jest.advanceTimersByTime(250);
        expect(service.setPageSize).toHaveBeenCalledWith(5);

        runInAction(() => atoms.dynamicPage.set(2));
        jest.advanceTimersByTime(250);
        expect(service.setPage).toHaveBeenCalledWith(2);
    });

    it("ignores non-positive inbound dynamic page size", () => {
        runInAction(() => atoms.dynamicPageSize.set(0));
        jest.advanceTimersByTime(250);
        expect(service.setPageSize).not.toHaveBeenCalledWith(0);

        runInAction(() => atoms.dynamicPageSize.set(-1));
        jest.advanceTimersByTime(250);
        expect(service.setPageSize).not.toHaveBeenCalledWith(-1);
    });

    it("syncs total count to service regardless of pagination mode", () => {
        runInAction(() => atoms.totalCount.set(123));
        expect(service.setTotalCount).toHaveBeenCalledWith(123);
    });

    it("does not call setTotalCount with sentinel -1 when totalCount is unavailable", () => {
        jest.clearAllMocks();
        // -1 is the sentinel value emitted before datasource.totalCount is available
        runInAction(() => atoms.totalCount.set(-1));
        expect(service.setTotalCount).not.toHaveBeenCalled();
    });

    it("syncs current page outbound to dynamicPage attribute (1-based)", () => {
        runInAction(() => atoms.currentPage.set(3));
        expect(lastArgToNumber(pageAttr.setValue as jest.MockedFunction<any>)).toBe(4);
    });

    it("syncs page size outbound to dynamicPageSize attribute", () => {
        runInAction(() => atoms.pageSize.set(25));
        expect(lastArgToNumber(pageSizeAttr.setValue as jest.MockedFunction<any>)).toBe(25);
    });

    it("syncs total count outbound to totalCountValue attribute via service", () => {
        runInAction(() => atoms.totalCount.set(200));
        expect(service.setTotalCount).toHaveBeenCalledWith(200);
    });

    it("syncs loaded rows to service", () => {
        runInAction(() => atoms.loadedRows.set(77));
        expect(service.setLoadedRows).toHaveBeenCalledWith(77);
    });

    it("does not call setLoadedRows for negative loaded rows", () => {
        runInAction(() => atoms.loadedRows.set(-1));
        expect(service.setLoadedRows).not.toHaveBeenCalledWith(-1);
    });

    it("does not overwrite dynamicPage attribute when gate.props reference changes but currentPage is unchanged", () => {
        // Regression: when setProps() fires (new observable.ref reference) but currentPage
        // hasn't changed yet, the outbound autorun must NOT re-run and reset the attribute.
        // This simulates: user writes dynamicPage=2, setProps fires immediately (React effect),
        // but DatasourceService.offset hasn't updated yet so currentPage is still 0.
        (pageAttr.setValue as jest.MockedFunction<any>).mockClear();

        // Simulate setProps creating a new props object (same attr instances, new wrapper)
        runInAction(() =>
            gate.setProps({
                dynamicPage: pageAttr,
                dynamicPageSize: pageSizeAttr,
                totalCountValue: totalCountAttr,
                loadedRowsValue: loadedRowsAttr
            })
        );

        // currentPage atom is still 0 — the autorun must NOT re-fire from a gate.props
        // reference change alone (untracked() guards against this)
        expect(pageAttr.setValue).not.toHaveBeenCalled();
    });

    it("skips inbound page/pageSize sync when disabled but still syncs totalCount and loadedRows", () => {
        dispose();
        jest.clearAllMocks();

        const feature = new DynamicPaginationFeature(
            makeHost(),
            { dynamicPageEnabled: false, dynamicPageSizeEnabled: false, isLimitBased: false },
            atoms.dynamicPage.atom,
            atoms.dynamicPageSize.atom,
            atoms.totalCount.atom,
            atoms.currentPage.atom,
            atoms.pageSize.atom,
            atoms.loadedRows.atom,
            gate,
            service
        );

        dispose = feature.setup();
        jest.clearAllMocks();

        runInAction(() => {
            atoms.dynamicPage.set(2);
            atoms.dynamicPageSize.set(25);
            atoms.totalCount.set(300);
            atoms.loadedRows.set(40);
        });

        jest.advanceTimersByTime(250);

        expect(service.setPage).not.toHaveBeenCalled();
        expect(service.setPageSize).not.toHaveBeenCalled();
        expect(pageAttr.setValue).not.toHaveBeenCalled();
        expect(pageSizeAttr.setValue).not.toHaveBeenCalled();
        expect(service.setTotalCount).toHaveBeenCalledWith(300);
        expect(service.setLoadedRows).toHaveBeenCalledWith(40);
    });

    describe("initialization — applies externally-provided values immediately without delay", () => {
        function createFeature(
            dynamicPageInitial: number,
            dynamicPageSizeInitial: number,
            pageSizeInitial = 10,
            isLimitBased = false
        ): { svc: jest.Mocked<GridPageControl>; dispose: () => void } {
            const svc: jest.Mocked<GridPageControl> = {
                setPage: jest.fn(),
                setPageSize: jest.fn(),
                setTotalCount: jest.fn(),
                setLoadedRows: jest.fn()
            };
            const initAtoms = {
                dynamicPage: boxAtom(dynamicPageInitial),
                dynamicPageSize: boxAtom(dynamicPageSizeInitial),
                totalCount: boxAtom(0),
                currentPage: boxAtom(0),
                pageSize: boxAtom(pageSizeInitial),
                loadedRows: boxAtom(0)
            };
            const initGate = new ObservableGate<GateProps>({
                dynamicPage: new EditableValueBuilder<Big>().build(),
                dynamicPageSize: new EditableValueBuilder<Big>().build()
            });
            const feature = new DynamicPaginationFeature(
                makeHost(),
                { dynamicPageEnabled: true, dynamicPageSizeEnabled: true, isLimitBased },
                initAtoms.dynamicPage.atom,
                initAtoms.dynamicPageSize.atom,
                initAtoms.totalCount.atom,
                initAtoms.currentPage.atom,
                initAtoms.pageSize.atom,
                initAtoms.loadedRows.atom,
                initGate,
                svc
            );
            return { svc, dispose: feature.setup() };
        }

        it("applies externally-provided pageSize immediately on setup without advancing timers", () => {
            const { svc, dispose } = createFeature(-1, 5);
            try {
                expect(svc.setPageSize).toHaveBeenCalledWith(5);
                expect(svc.setPageSize).toHaveBeenCalledTimes(1);
            } finally {
                dispose();
            }
        });

        it("applies externally-provided page immediately on setup without advancing timers", () => {
            const { svc, dispose } = createFeature(4, -1);
            try {
                expect(svc.setPage).toHaveBeenCalledWith(4);
                expect(svc.setPage).toHaveBeenCalledTimes(1);
            } finally {
                dispose();
            }
        });

        it("applies both page and pageSize immediately when both are provided", () => {
            const { svc, dispose } = createFeature(4, 5);
            try {
                expect(svc.setPageSize).toHaveBeenCalledWith(5);
                expect(svc.setPage).toHaveBeenCalledWith(4);
            } finally {
                dispose();
            }
        });

        it("does not call setPageSize when initial dynamicPageSize is the sentinel -1", () => {
            const { svc, dispose } = createFeature(-1, -1);
            try {
                expect(svc.setPageSize).not.toHaveBeenCalled();
            } finally {
                dispose();
            }
        });

        it("does not call setPage when initial dynamicPage is the sentinel -1", () => {
            const { svc, dispose } = createFeature(-1, -1);
            try {
                expect(svc.setPage).not.toHaveBeenCalled();
            } finally {
                dispose();
            }
        });

        it("does not call setPageSize for a zero initial dynamicPageSize", () => {
            const { svc, dispose } = createFeature(-1, 0);
            try {
                expect(svc.setPageSize).not.toHaveBeenCalled();
            } finally {
                dispose();
            }
        });
    });

    describe("limit-based (virtual scroll / loadMore)", () => {
        let limitDispose: () => void;
        let limitAtoms: typeof atoms;
        let limitPageAttr: EditableValue<Big>;

        beforeEach(() => {
            limitPageAttr = new EditableValueBuilder<Big>().build();
            const limitGate = new ObservableGate<GateProps>({
                dynamicPage: limitPageAttr
            });

            limitAtoms = {
                dynamicPage: boxAtom(-1),
                dynamicPageSize: boxAtom(-1),
                totalCount: boxAtom(0),
                currentPage: boxAtom(1),
                pageSize: boxAtom(10),
                loadedRows: boxAtom(0)
            };

            const feature = new DynamicPaginationFeature(
                makeHost(),
                { dynamicPageEnabled: true, dynamicPageSizeEnabled: false, isLimitBased: true },
                limitAtoms.dynamicPage.atom,
                limitAtoms.dynamicPageSize.atom,
                limitAtoms.totalCount.atom,
                limitAtoms.currentPage.atom,
                limitAtoms.pageSize.atom,
                limitAtoms.loadedRows.atom,
                limitGate,
                service
            );

            limitDispose = feature.setup();
        });

        afterEach(() => {
            limitDispose();
        });

        it("writes currentPage as-is to dynamicPage attribute (no +1 for limit-based)", () => {
            jest.clearAllMocks();
            runInAction(() => limitAtoms.currentPage.set(2));
            expect(lastArgToNumber(limitPageAttr.setValue as jest.MockedFunction<any>)).toBe(2);
        });

        it("does not re-trigger inbound reaction after outbound sync (no infinite loop)", () => {
            // Regression: if outbound wrote page+1, the inbound reaction would see a new
            // attribute value and call setPage again, creating an infinite load loop.
            jest.clearAllMocks();

            // Simulate virtual scroll bumping page 1 → 2
            runInAction(() => limitAtoms.dynamicPage.set(2));
            jest.advanceTimersByTime(250);

            // Only one setPage call expected — no feedback loop
            expect(service.setPage).toHaveBeenCalledTimes(1);
            expect(service.setPage).toHaveBeenCalledWith(2);
        });

        it("rejects dynamicPage = 0 (setLimit(0) is invalid for virtual scroll)", () => {
            jest.clearAllMocks();

            runInAction(() => limitAtoms.dynamicPage.set(0));
            jest.advanceTimersByTime(250);

            expect(service.setPage).not.toHaveBeenCalled();
        });

        it("accepts dynamicPage changes > 0 after initialization", () => {
            jest.clearAllMocks();

            runInAction(() => limitAtoms.dynamicPage.set(3));
            jest.advanceTimersByTime(250);

            expect(service.setPage).toHaveBeenCalledWith(3);
            expect(service.setPage).toHaveBeenCalledTimes(1);
        });
    });

    describe("limit-based initialization — does not apply stale dynamicPage on first load", () => {
        function createLimitFeature(
            dynamicPageInitial: number,
            dynamicPageSizeInitial: number,
            pageSizeInitial = 10
        ): { svc: jest.Mocked<GridPageControl>; atoms: ReturnType<typeof createAtoms>; dispose: () => void } {
            const svc: jest.Mocked<GridPageControl> = {
                setPage: jest.fn(),
                setPageSize: jest.fn(),
                setTotalCount: jest.fn(),
                setLoadedRows: jest.fn()
            };
            const initAtoms = createAtoms(dynamicPageInitial, dynamicPageSizeInitial, pageSizeInitial);
            const initGate = new ObservableGate<GateProps>({
                dynamicPage: new EditableValueBuilder<Big>().build(),
                dynamicPageSize: new EditableValueBuilder<Big>().build()
            });
            const feature = new DynamicPaginationFeature(
                makeHost(),
                { dynamicPageEnabled: true, dynamicPageSizeEnabled: true, isLimitBased: true },
                initAtoms.dynamicPage.atom,
                initAtoms.dynamicPageSize.atom,
                initAtoms.totalCount.atom,
                initAtoms.currentPage.atom,
                initAtoms.pageSize.atom,
                initAtoms.loadedRows.atom,
                initGate,
                svc
            );
            return { svc, atoms: initAtoms, dispose: feature.setup() };
        }

        function createAtoms(
            dynamicPage: number,
            dynamicPageSize: number,
            pageSize: number
        ): {
            dynamicPage: NumberAtomBox;
            dynamicPageSize: NumberAtomBox;
            totalCount: NumberAtomBox;
            currentPage: NumberAtomBox;
            pageSize: NumberAtomBox;
            loadedRows: NumberAtomBox;
        } {
            return {
                dynamicPage: boxAtom(dynamicPage),
                dynamicPageSize: boxAtom(dynamicPageSize),
                totalCount: boxAtom(0),
                currentPage: boxAtom(0),
                pageSize: boxAtom(pageSize),
                loadedRows: boxAtom(0)
            };
        }

        it("does NOT apply stale dynamicPage=5 on first load (would inflate limit to 5*pageSize)", () => {
            // Regression: a persisted/default dynamicPage=5 with pageSize=5 would cause
            // setLimit(5*5)=25, loading 25 items instead of the expected 5.
            const { svc, dispose } = createLimitFeature(5, -1, 5);
            try {
                // fireImmediately is false for limit-based, so setPage must NOT be called
                expect(svc.setPage).not.toHaveBeenCalled();
            } finally {
                dispose();
            }
        });

        it("does NOT apply dynamicPage=0 on first load for limit-based pagination", () => {
            const { svc, dispose } = createLimitFeature(0, -1, 5);
            try {
                expect(svc.setPage).not.toHaveBeenCalled();
            } finally {
                dispose();
            }
        });

        it("still applies dynamicPageSize immediately for limit-based pagination", () => {
            // dynamicPageSize fireImmediately remains true for all modes
            const { svc, dispose } = createLimitFeature(-1, 15, 10);
            try {
                expect(svc.setPageSize).toHaveBeenCalledWith(15);
                expect(svc.setPageSize).toHaveBeenCalledTimes(1);
            } finally {
                dispose();
            }
        });

        it("picks up subsequent dynamicPage changes after init", () => {
            const { svc, atoms: a, dispose } = createLimitFeature(5, -1, 5);
            try {
                // Stale initial value NOT applied (fireImmediately: false)
                expect(svc.setPage).not.toHaveBeenCalled();

                // Simulate user scroll bumping page
                runInAction(() => a.dynamicPage.set(2));
                jest.advanceTimersByTime(250);

                expect(svc.setPage).toHaveBeenCalledWith(2);
                expect(svc.setPage).toHaveBeenCalledTimes(1);
            } finally {
                dispose();
            }
        });

        it("offset-based pagination still applies dynamicPage immediately on setup", () => {
            // Ensure we didn't break offset-based (buttons) behavior
            const svc: jest.Mocked<GridPageControl> = {
                setPage: jest.fn(),
                setPageSize: jest.fn(),
                setTotalCount: jest.fn(),
                setLoadedRows: jest.fn()
            };
            const initAtoms = {
                dynamicPage: boxAtom(4),
                dynamicPageSize: boxAtom(-1),
                totalCount: boxAtom(0),
                currentPage: boxAtom(0),
                pageSize: boxAtom(10),
                loadedRows: boxAtom(0)
            };
            const initGate = new ObservableGate<GateProps>({
                dynamicPage: new EditableValueBuilder<Big>().build()
            });
            const feature = new DynamicPaginationFeature(
                makeHost(),
                { dynamicPageEnabled: true, dynamicPageSizeEnabled: false, isLimitBased: false },
                initAtoms.dynamicPage.atom,
                initAtoms.dynamicPageSize.atom,
                initAtoms.totalCount.atom,
                initAtoms.currentPage.atom,
                initAtoms.pageSize.atom,
                initAtoms.loadedRows.atom,
                initGate,
                svc
            );
            const d = feature.setup();
            try {
                expect(svc.setPage).toHaveBeenCalledWith(4);
                expect(svc.setPage).toHaveBeenCalledTimes(1);
            } finally {
                d();
            }
        });
    });
});
