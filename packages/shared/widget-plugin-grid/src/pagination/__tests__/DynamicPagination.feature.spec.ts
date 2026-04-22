import { DerivedPropsGate, SetupComponent, SetupComponentHost } from "@mendix/widget-plugin-mobx-kit/main";
import { editable } from "@mendix/widget-plugin-test-utils";
import { Big } from "big.js";
import { action, IObservableValue, makeObservable, observable, runInAction } from "mobx";
import { EditableValue } from "mendix";
import { GridPageControl } from "../../interfaces/GridPageControl";
import { DynamicPaginationFeature } from "../DynamicPagination.feature";

type GateProps = {
    dynamicPage?: EditableValue<Big>;
    dynamicPageSize?: EditableValue<Big>;
    totalCountValue?: EditableValue<Big>;
    dynamicItemCount?: EditableValue<Big>;
};

type AtomsFixture = {
    dynamicPage: IObservableValue<number>;
    dynamicPageSize: IObservableValue<number>;
    totalCount: IObservableValue<number>;
    currentPage: IObservableValue<number>;
    pageSize: IObservableValue<number>;
    itemCount: IObservableValue<number>;
};

type AttributesFixture = {
    page: EditableValue<Big>;
    pageSize: EditableValue<Big>;
    totalCount: EditableValue<Big>;
    itemCount: EditableValue<Big>;
};

type FeatureConfig = {
    dynamicPageEnabled: boolean;
    dynamicPageSizeEnabled: boolean;
    isLimitBased: boolean;
};

function lastArgToNumber(mockFn: jest.MockedFunction<any>): number {
    const calls = mockFn.mock.calls;
    return calls[calls.length - 1][0].toNumber();
}

function makeHost(): SetupComponentHost {
    return {
        add: (_component: SetupComponent) => {},
        remove: (_component: SetupComponent) => {},
        setup: () => () => {}
    } as SetupComponentHost;
}

function createMockService(): jest.Mocked<GridPageControl> {
    return {
        setPage: jest.fn(),
        setPageSize: jest.fn(),
        setTotalCount: jest.fn(),
        setItemCount: jest.fn()
    };
}

function createAtoms(overrides?: Partial<Record<keyof AtomsFixture, number>>): AtomsFixture {
    return {
        dynamicPage: observable.box(overrides?.dynamicPage ?? -1),
        dynamicPageSize: observable.box(overrides?.dynamicPageSize ?? -1),
        totalCount: observable.box(overrides?.totalCount ?? 0),
        currentPage: observable.box(overrides?.currentPage ?? 0),
        pageSize: observable.box(overrides?.pageSize ?? 10),
        itemCount: observable.box(overrides?.itemCount ?? 0)
    };
}

function createAttributes(overrides?: Partial<AttributesFixture>): AttributesFixture {
    return {
        page: overrides?.page ?? editable<Big>(),
        pageSize: overrides?.pageSize ?? editable<Big>(),
        totalCount: overrides?.totalCount ?? editable<Big>(),
        itemCount: overrides?.itemCount ?? editable<Big>()
    };
}

function createFeature(
    config: FeatureConfig,
    atoms: AtomsFixture,
    attributes: AttributesFixture,
    service: GridPageControl
): { feature: DynamicPaginationFeature; dispose: () => void } {
    const gate = new ObservableGate({
        dynamicPage: attributes.page,
        dynamicPageSize: attributes.pageSize,
        totalCountValue: attributes.totalCount,
        dynamicItemCount: attributes.itemCount
    });

    const feature = new DynamicPaginationFeature(
        makeHost(),
        config,
        atoms.dynamicPage,
        atoms.dynamicPageSize,
        atoms.totalCount,
        atoms.currentPage,
        atoms.itemCount,
        gate,
        service
    );

    return { feature, dispose: feature.setup() };
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
    let atoms: AtomsFixture;
    let attributes: AttributesFixture;
    let dispose: () => void;

    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        if (dispose) {
            dispose();
            dispose = undefined!;
        }
        jest.useRealTimers();
    });

    describe("Basic synchronization", () => {
        beforeEach(() => {
            service = createMockService();
            atoms = createAtoms();
            attributes = createAttributes();

            const result = createFeature(
                { dynamicPageEnabled: true, dynamicPageSizeEnabled: true, isLimitBased: false },
                atoms,
                attributes,
                service
            );
            dispose = result.dispose;
        });

        it("syncs inbound pageSize to service", () => {
            runInAction(() => atoms.dynamicPageSize.set(5));
            jest.advanceTimersByTime(250);
            expect(service.setPageSize).toHaveBeenCalledWith(5);
        });

        it("syncs inbound page to service", () => {
            runInAction(() => atoms.dynamicPage.set(2));
            jest.advanceTimersByTime(250);
            expect(service.setPage).toHaveBeenCalledWith(2);
        });

        it("syncs totalCount to service immediately", () => {
            runInAction(() => atoms.totalCount.set(123));
            expect(service.setTotalCount).toHaveBeenCalledWith(123);
        });

        it("syncs currentPage outbound to dynamicPage attribute (1-based)", () => {
            runInAction(() => atoms.currentPage.set(3));
            expect(lastArgToNumber(attributes.page.setValue as jest.MockedFunction<any>)).toBe(4);
        });

        it("syncs itemCount to service immediately", () => {
            runInAction(() => atoms.itemCount.set(77));
            expect(service.setItemCount).toHaveBeenCalledWith(77);
        });
    });

    describe("Validation guards", () => {
        beforeEach(() => {
            service = createMockService();
            atoms = createAtoms();
            attributes = createAttributes();

            const result = createFeature(
                { dynamicPageEnabled: true, dynamicPageSizeEnabled: true, isLimitBased: false },
                atoms,
                attributes,
                service
            );
            dispose = result.dispose;
        });

        it("ignores zero inbound pageSize", () => {
            runInAction(() => atoms.dynamicPageSize.set(0));
            jest.advanceTimersByTime(250);
            expect(service.setPageSize).not.toHaveBeenCalledWith(0);
        });

        it("ignores negative inbound pageSize", () => {
            runInAction(() => atoms.dynamicPageSize.set(-1));
            jest.advanceTimersByTime(250);
            expect(service.setPageSize).not.toHaveBeenCalledWith(-1);
        });

        it("ignores sentinel -1 for totalCount", () => {
            jest.clearAllMocks();
            runInAction(() => atoms.totalCount.set(-1));
            expect(service.setTotalCount).not.toHaveBeenCalled();
        });

        it("ignores negative itemCount", () => {
            runInAction(() => atoms.itemCount.set(-1));
            expect(service.setItemCount).not.toHaveBeenCalledWith(-1);
        });
    });

    describe("Configuration", () => {
        it("skips page/pageSize sync when disabled, but still syncs totalCount/itemCount", () => {
            service = createMockService();
            atoms = createAtoms();
            attributes = createAttributes();

            const result = createFeature(
                { dynamicPageEnabled: false, dynamicPageSizeEnabled: false, isLimitBased: false },
                atoms,
                attributes,
                service
            );
            dispose = result.dispose;

            jest.clearAllMocks();

            runInAction(() => {
                atoms.dynamicPage.set(2);
                atoms.dynamicPageSize.set(25);
                atoms.totalCount.set(300);
                atoms.itemCount.set(40);
            });

            jest.advanceTimersByTime(250);

            expect(service.setPage).not.toHaveBeenCalled();
            expect(service.setPageSize).not.toHaveBeenCalled();
            expect(attributes.page.setValue).not.toHaveBeenCalled();
            expect(attributes.pageSize.setValue).not.toHaveBeenCalled();
            expect(service.setTotalCount).toHaveBeenCalledWith(300);
            expect(service.setItemCount).toHaveBeenCalledWith(40);
        });
    });

    describe("Edge cases", () => {
        beforeEach(() => {
            service = createMockService();
            atoms = createAtoms();
            attributes = createAttributes();

            const result = createFeature(
                { dynamicPageEnabled: true, dynamicPageSizeEnabled: true, isLimitBased: false },
                atoms,
                attributes,
                service
            );
            dispose = result.dispose;
        });

        it("does not overwrite attribute when gate.props changes but currentPage unchanged", () => {
            (attributes.page.setValue as jest.MockedFunction<any>).mockClear();

            // Simulate setProps creating a new props object (same attr instances, new wrapper)
            const gate = new ObservableGate<GateProps>({
                dynamicPage: attributes.page,
                dynamicPageSize: attributes.pageSize,
                totalCountValue: attributes.totalCount,
                dynamicItemCount: attributes.itemCount
            });

            runInAction(() =>
                gate.setProps({
                    dynamicPage: attributes.page,
                    dynamicPageSize: attributes.pageSize,
                    totalCountValue: attributes.totalCount,
                    dynamicItemCount: attributes.itemCount
                })
            );

            // currentPage atom is still 0 — the autorun must NOT re-fire from a gate.props
            // reference change alone (untracked() guards against this)
            expect(attributes.page.setValue).not.toHaveBeenCalled();
        });
    });

    describe("Offset-based pagination", () => {
        describe("Initialization", () => {
            let localDispose: (() => void) | undefined;

            afterEach(() => {
                if (localDispose) {
                    localDispose();
                    localDispose = undefined;
                }
            });

            it("applies externally-provided pageSize immediately on setup", () => {
                const svc = createMockService();
                const result = createFeature(
                    { dynamicPageEnabled: true, dynamicPageSizeEnabled: true, isLimitBased: false },
                    createAtoms({ dynamicPageSize: 5 }),
                    createAttributes(),
                    svc
                );
                localDispose = result.dispose;

                expect(svc.setPageSize).toHaveBeenCalledWith(5);
                expect(svc.setPageSize).toHaveBeenCalledTimes(1);
            });

            it("applies externally-provided page immediately on setup", () => {
                const svc = createMockService();
                const result = createFeature(
                    { dynamicPageEnabled: true, dynamicPageSizeEnabled: true, isLimitBased: false },
                    createAtoms({ dynamicPage: 4 }),
                    createAttributes(),
                    svc
                );
                localDispose = result.dispose;

                expect(svc.setPage).toHaveBeenCalledWith(4);
                expect(svc.setPage).toHaveBeenCalledTimes(1);
            });

            it("applies both page and pageSize when both provided", () => {
                const svc = createMockService();
                const result = createFeature(
                    { dynamicPageEnabled: true, dynamicPageSizeEnabled: true, isLimitBased: false },
                    createAtoms({ dynamicPage: 4, dynamicPageSize: 5 }),
                    createAttributes(),
                    svc
                );
                localDispose = result.dispose;

                expect(svc.setPageSize).toHaveBeenCalledWith(5);
                expect(svc.setPage).toHaveBeenCalledWith(4);
            });

            it("does not call setPageSize for sentinel -1", () => {
                const svc = createMockService();
                const result = createFeature(
                    { dynamicPageEnabled: true, dynamicPageSizeEnabled: true, isLimitBased: false },
                    createAtoms({ dynamicPageSize: -1 }),
                    createAttributes(),
                    svc
                );
                localDispose = result.dispose;

                expect(svc.setPageSize).not.toHaveBeenCalled();
            });

            it("does not call setPage for sentinel -1", () => {
                const svc = createMockService();
                const result = createFeature(
                    { dynamicPageEnabled: true, dynamicPageSizeEnabled: true, isLimitBased: false },
                    createAtoms({ dynamicPage: -1 }),
                    createAttributes(),
                    svc
                );
                localDispose = result.dispose;

                expect(svc.setPage).not.toHaveBeenCalled();
            });

            it("does not call setPageSize for zero", () => {
                const svc = createMockService();
                const result = createFeature(
                    { dynamicPageEnabled: true, dynamicPageSizeEnabled: true, isLimitBased: false },
                    createAtoms({ dynamicPageSize: 0 }),
                    createAttributes(),
                    svc
                );
                localDispose = result.dispose;

                expect(svc.setPageSize).not.toHaveBeenCalled();
            });
        });

        describe("Runtime behavior", () => {
            beforeEach(() => {
                service = createMockService();
                atoms = createAtoms();
                attributes = createAttributes();

                const result = createFeature(
                    { dynamicPageEnabled: true, dynamicPageSizeEnabled: true, isLimitBased: false },
                    atoms,
                    attributes,
                    service
                );
                dispose = result.dispose;
            });

            it("debounces rapid page changes (250ms)", () => {
                runInAction(() => atoms.dynamicPage.set(2));
                jest.advanceTimersByTime(100);
                expect(service.setPage).not.toHaveBeenCalled();

                jest.advanceTimersByTime(150);
                expect(service.setPage).toHaveBeenCalledWith(2);
            });

            it("converts 0-based currentPage to 1-based attribute value", () => {
                runInAction(() => atoms.currentPage.set(0));
                expect(lastArgToNumber(attributes.page.setValue as jest.MockedFunction<any>)).toBe(1);

                runInAction(() => atoms.currentPage.set(5));
                expect(lastArgToNumber(attributes.page.setValue as jest.MockedFunction<any>)).toBe(6);
            });
        });
    });

    describe("Limit-based pagination (virtual scroll)", () => {
        describe("Initialization", () => {
            let localDispose: (() => void) | undefined;

            afterEach(() => {
                if (localDispose) {
                    localDispose();
                    localDispose = undefined;
                }
            });

            it("does NOT apply stale dynamicPage on first load (fireImmediately: false)", () => {
                const svc = createMockService();
                const result = createFeature(
                    { dynamicPageEnabled: true, dynamicPageSizeEnabled: true, isLimitBased: true },
                    createAtoms({ dynamicPage: 5, pageSize: 5 }),
                    createAttributes(),
                    svc
                );
                localDispose = result.dispose;

                // Regression: a persisted/default dynamicPage=5 with pageSize=5 would cause
                // setLimit(5*5)=25, loading 25 items instead of the expected 5.
                expect(svc.setPage).not.toHaveBeenCalled();
            });

            it("does NOT apply dynamicPage=0 on first load", () => {
                const svc = createMockService();
                const result = createFeature(
                    { dynamicPageEnabled: true, dynamicPageSizeEnabled: true, isLimitBased: true },
                    createAtoms({ dynamicPage: 0, pageSize: 5 }),
                    createAttributes(),
                    svc
                );
                localDispose = result.dispose;

                expect(svc.setPage).not.toHaveBeenCalled();
            });

            it("still applies dynamicPageSize immediately (fireImmediately: true)", () => {
                const svc = createMockService();
                const result = createFeature(
                    { dynamicPageEnabled: true, dynamicPageSizeEnabled: true, isLimitBased: true },
                    createAtoms({ dynamicPageSize: 15, pageSize: 10 }),
                    createAttributes(),
                    svc
                );
                localDispose = result.dispose;

                // dynamicPageSize fireImmediately remains true for all modes
                expect(svc.setPageSize).toHaveBeenCalledWith(15);
                expect(svc.setPageSize).toHaveBeenCalledTimes(1);
            });

            it("picks up subsequent dynamicPage changes after ignored initial value", () => {
                const svc = createMockService();
                const testAtoms = createAtoms({ dynamicPage: 5, pageSize: 5 });
                const result = createFeature(
                    { dynamicPageEnabled: true, dynamicPageSizeEnabled: true, isLimitBased: true },
                    testAtoms,
                    createAttributes(),
                    svc
                );
                localDispose = result.dispose;

                // Stale initial value NOT applied (fireImmediately: false)
                expect(svc.setPage).not.toHaveBeenCalled();

                // Simulate user scroll bumping page
                runInAction(() => testAtoms.dynamicPage.set(2));
                jest.advanceTimersByTime(250);

                expect(svc.setPage).toHaveBeenCalledWith(2);
                expect(svc.setPage).toHaveBeenCalledTimes(1);
            });

            it("offset-based pagination still applies dynamicPage immediately on setup", () => {
                // Ensure we didn't break offset-based (buttons) behavior
                const svc = createMockService();
                const result = createFeature(
                    { dynamicPageEnabled: true, dynamicPageSizeEnabled: false, isLimitBased: false },
                    createAtoms({ dynamicPage: 4 }),
                    createAttributes(),
                    svc
                );
                localDispose = result.dispose;

                expect(svc.setPage).toHaveBeenCalledWith(4);
                expect(svc.setPage).toHaveBeenCalledTimes(1);
            });
        });

        describe("Runtime behavior", () => {
            beforeEach(() => {
                service = createMockService();
                atoms = createAtoms({ currentPage: 1 });
                attributes = createAttributes();

                const result = createFeature(
                    { dynamicPageEnabled: true, dynamicPageSizeEnabled: false, isLimitBased: true },
                    atoms,
                    attributes,
                    service
                );
                dispose = result.dispose;
            });

            it("writes currentPage as-is to attribute (no +1 for limit-based)", () => {
                jest.clearAllMocks();
                runInAction(() => atoms.currentPage.set(2));
                expect(lastArgToNumber(attributes.page.setValue as jest.MockedFunction<any>)).toBe(2);
            });

            it("does not trigger infinite loop (outbound doesn't trigger inbound)", () => {
                // Regression: if outbound wrote page+1, the inbound reaction would see a new
                // attribute value and call setPage again, creating an infinite load loop.
                jest.clearAllMocks();

                // Simulate virtual scroll bumping page 1 → 2
                runInAction(() => atoms.dynamicPage.set(2));
                jest.advanceTimersByTime(250);

                // Only one setPage call expected — no feedback loop
                expect(service.setPage).toHaveBeenCalledTimes(1);
                expect(service.setPage).toHaveBeenCalledWith(2);
            });

            it("rejects dynamicPage=0 (invalid for virtual scroll)", () => {
                jest.clearAllMocks();

                runInAction(() => atoms.dynamicPage.set(0));
                jest.advanceTimersByTime(250);

                // setLimit(0) is invalid for virtual scroll
                expect(service.setPage).not.toHaveBeenCalled();
            });

            it("accepts dynamicPage>0 after initialization", () => {
                jest.clearAllMocks();

                runInAction(() => atoms.dynamicPage.set(3));
                jest.advanceTimersByTime(250);

                expect(service.setPage).toHaveBeenCalledWith(3);
                expect(service.setPage).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe("Timing and debounce", () => {
        beforeEach(() => {
            service = createMockService();
            atoms = createAtoms();
            attributes = createAttributes();

            const result = createFeature(
                { dynamicPageEnabled: true, dynamicPageSizeEnabled: true, isLimitBased: false },
                atoms,
                attributes,
                service
            );
            dispose = result.dispose;
        });

        it("debounces page changes to 250ms", () => {
            runInAction(() => atoms.dynamicPage.set(3));

            jest.advanceTimersByTime(100);
            expect(service.setPage).not.toHaveBeenCalled();

            jest.advanceTimersByTime(100);
            expect(service.setPage).not.toHaveBeenCalled();

            jest.advanceTimersByTime(50);
            expect(service.setPage).toHaveBeenCalledWith(3);
        });

        it("debounces pageSize changes to 250ms", () => {
            runInAction(() => atoms.dynamicPageSize.set(20));

            jest.advanceTimersByTime(249);
            expect(service.setPageSize).not.toHaveBeenCalled();

            jest.advanceTimersByTime(1);
            expect(service.setPageSize).toHaveBeenCalledWith(20);
        });

        it("applies latest value after debounce with rapid consecutive changes", () => {
            // MobX reaction delay doesn't restart the timer, it uses the latest value when timer fires
            runInAction(() => atoms.dynamicPage.set(2));
            jest.advanceTimersByTime(200);

            // Second change before first debounce completes - updates the value to be used
            runInAction(() => atoms.dynamicPage.set(3));

            // Advance to complete the 250ms debounce from the first change
            jest.advanceTimersByTime(50);

            // Should be called once with the latest value (3, not 2)
            expect(service.setPage).toHaveBeenCalledTimes(1);
            expect(service.setPage).toHaveBeenCalledWith(3);
        });

        it("does not debounce totalCount (immediate sync)", () => {
            runInAction(() => atoms.totalCount.set(100));
            // No timer advancement needed
            expect(service.setTotalCount).toHaveBeenCalledWith(100);
        });

        it("does not debounce itemCount (immediate sync)", () => {
            runInAction(() => atoms.itemCount.set(50));
            // No timer advancement needed
            expect(service.setItemCount).toHaveBeenCalledWith(50);
        });
    });
});
