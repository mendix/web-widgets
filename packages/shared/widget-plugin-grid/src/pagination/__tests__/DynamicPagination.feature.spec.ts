import {
    ComputedAtom,
    DerivedPropsGate,
    SetupComponent,
    SetupComponentHost
} from "@mendix/widget-plugin-mobx-kit/main";
import { EditableValueBuilder } from "@mendix/widget-plugin-test-utils";
import { Big } from "big.js";
import { computed, observable, runInAction } from "mobx";
import { EditableValue } from "mendix";
import { GridPageControl } from "../../interfaces/GridPageControl";
import { DynamicPaginationFeature } from "../DynamicPagination.feature";

type GateProps = {
    dynamicPage?: EditableValue<Big>;
    dynamicPageSize?: EditableValue<Big>;
    totalCountValue?: EditableValue<Big>;
    loadedRowsValue?: EditableValue<Big>;
};

type NumberAtomBox = {
    atom: ComputedAtom<number>;
    set: (value: number) => void;
};

function boxAtom(initial: number): NumberAtomBox {
    const box = observable.box(initial);
    return {
        atom: computed(() => box.get()) as ComputedAtom<number>,
        set: (value: number) => box.set(value)
    };
}

describe("DynamicPaginationFeature", () => {
    let service: jest.Mocked<GridPageControl>;
    let gate: DerivedPropsGate<GateProps>;
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
            setTotalCount: jest.fn()
        };

        gate = {
            props: {},
            previousProps: {},
            version: 0
        } as unknown as DerivedPropsGate<GateProps>;
        pageAttr = new EditableValueBuilder<Big>().build();
        pageSizeAttr = new EditableValueBuilder<Big>().build();
        totalCountAttr = new EditableValueBuilder<Big>().build();
        loadedRowsAttr = new EditableValueBuilder<Big>().build();
        gate.props.dynamicPage = pageAttr;
        gate.props.dynamicPageSize = pageSizeAttr;
        gate.props.totalCountValue = totalCountAttr;
        gate.props.loadedRowsValue = loadedRowsAttr;

        atoms = {
            dynamicPage: boxAtom(-1),
            dynamicPageSize: boxAtom(-1),
            totalCount: boxAtom(0),
            currentPage: boxAtom(0),
            pageSize: boxAtom(10),
            loadedRows: boxAtom(0)
        };

        const feature = new DynamicPaginationFeature(
            {
                add: (_component: SetupComponent) => {},
                remove: (_component: SetupComponent) => {},
                setup: () => () => {}
            } as SetupComponentHost,
            {
                isLimitBased: false,
                dynamicPageEnabled: true,
                dynamicPageSizeEnabled: true
            },
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

    it("syncs inbound values to page control service", () => {
        runInAction(() => atoms.dynamicPageSize.set(5));
        jest.advanceTimersByTime(250);
        expect(service.setPageSize).toHaveBeenCalledWith(5);

        runInAction(() => atoms.dynamicPage.set(2));
        jest.advanceTimersByTime(250);
        expect(service.setPage).toHaveBeenCalledWith(2);

        runInAction(() => atoms.totalCount.set(123));
        expect(service.setTotalCount).toHaveBeenCalledWith(123);
    });

    it("syncs outbound values to mapped attributes", () => {
        runInAction(() => atoms.currentPage.set(3));
        expect(pageAttr.setValue).toHaveBeenCalledWith(new Big(4));

        runInAction(() => atoms.pageSize.set(25));
        expect(pageSizeAttr.setValue).toHaveBeenCalledWith(new Big(25));

        runInAction(() => atoms.totalCount.set(200));
        expect(totalCountAttr.setValue).toHaveBeenCalledWith(new Big(200));

        runInAction(() => atoms.loadedRows.set(77));
        expect(loadedRowsAttr.setValue).toHaveBeenCalledWith(new Big(77));
    });

    it("does not write invalid loaded rows values", () => {
        runInAction(() => atoms.loadedRows.set(-1));
        expect(loadedRowsAttr.setValue).not.toHaveBeenCalledWith(new Big(-1));
    });
});
