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
            { dynamicPageEnabled: true, dynamicPageSizeEnabled: true },
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
            { dynamicPageEnabled: false, dynamicPageSizeEnabled: false },
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
});
