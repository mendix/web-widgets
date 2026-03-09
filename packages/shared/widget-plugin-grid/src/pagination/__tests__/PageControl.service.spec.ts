import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { EditableValueBuilder } from "@mendix/widget-plugin-test-utils";
import { Big } from "big.js";
import { EditableValue } from "mendix";
import { SetPageAction, SetPageSizeAction } from "../pagination.model";
import { PageControlService } from "../PageControl.service";

type GateProps = {
    dynamicPage?: EditableValue<Big>;
    dynamicPageSize?: EditableValue<Big>;
    totalCountValue?: EditableValue<Big>;
    loadedRowsValue?: EditableValue<Big>;
};

function makeGate(props: Partial<GateProps> = {}): DerivedPropsGate<any> {
    return { props } as DerivedPropsGate<any>;
}

function argToNumber(mockFn: jest.MockedFunction<any>, callIndex = 0): number {
    return mockFn.mock.calls[callIndex][0].toNumber();
}

describe("PageControlService", () => {
    let setPage: jest.MockedFunction<SetPageAction>;
    let setPageSize: jest.MockedFunction<SetPageSizeAction>;

    beforeEach(() => {
        setPage = jest.fn();
        setPageSize = jest.fn();
    });

    describe("setPage", () => {
        it("delegates to setPageAction", () => {
            const service = new PageControlService(makeGate(), setPageSize, setPage);
            service.setPage(3);
            expect(setPage).toHaveBeenCalledWith(3);
        });

        it("writes 1-based page number to dynamicPage attribute", () => {
            const attr = new EditableValueBuilder<Big>().build();
            const service = new PageControlService(makeGate({ dynamicPage: attr }), setPageSize, setPage);

            service.setPage(3);
            expect(argToNumber(attr.setValue as jest.MockedFunction<any>)).toBe(4);
        });

        it("does not throw when dynamicPage attribute is not mapped", () => {
            const service = new PageControlService(makeGate(), setPageSize, setPage);
            expect(() => service.setPage(0)).not.toThrow();
        });

        it("skips write when dynamicPage attribute is readOnly", () => {
            const attr = new EditableValueBuilder<Big>().isReadOnly().build();
            const service = new PageControlService(makeGate({ dynamicPage: attr }), setPageSize, setPage);

            service.setPage(1);
            expect(attr.setValue).not.toHaveBeenCalled();
        });
    });

    describe("setPageSize", () => {
        it("delegates to setPageSizeAction", () => {
            const service = new PageControlService(makeGate(), setPageSize, setPage);
            service.setPageSize(25);
            expect(setPageSize).toHaveBeenCalledWith(25);
        });

        it("writes page size to dynamicPageSize attribute", () => {
            const attr = new EditableValueBuilder<Big>().build();
            const service = new PageControlService(makeGate({ dynamicPageSize: attr }), setPageSize, setPage);

            service.setPageSize(42);
            expect(argToNumber(attr.setValue as jest.MockedFunction<any>)).toBe(42);
        });

        it("does not throw when dynamicPageSize attribute is not mapped", () => {
            const service = new PageControlService(makeGate(), setPageSize, setPage);
            expect(() => service.setPageSize(10)).not.toThrow();
        });

        it("skips write when dynamicPageSize attribute is readOnly", () => {
            const attr = new EditableValueBuilder<Big>().isReadOnly().build();
            const service = new PageControlService(makeGate({ dynamicPageSize: attr }), setPageSize, setPage);

            service.setPageSize(10);
            expect(attr.setValue).not.toHaveBeenCalled();
        });
    });

    describe("setTotalCount", () => {
        it("writes totalCountValue when attribute is mapped", () => {
            const attr = new EditableValueBuilder<Big>().build();
            const service = new PageControlService(makeGate({ totalCountValue: attr }), setPageSize, setPage);

            service.setTotalCount(123);
            expect(argToNumber(attr.setValue as jest.MockedFunction<any>)).toBe(123);
        });

        it("does not throw when totalCountValue attribute is not mapped", () => {
            const service = new PageControlService(makeGate(), setPageSize, setPage);
            expect(() => service.setTotalCount(5)).not.toThrow();
        });
    });

    describe("setLoadedRows", () => {
        it("writes loadedRowsValue when attribute is mapped", () => {
            const attr = new EditableValueBuilder<Big>().build();
            const service = new PageControlService(makeGate({ loadedRowsValue: attr }), setPageSize, setPage);

            service.setLoadedRows(77);
            expect(argToNumber(attr.setValue as jest.MockedFunction<any>)).toBe(77);
        });

        it("does not throw when loadedRowsValue attribute is not mapped", () => {
            const service = new PageControlService(makeGate(), setPageSize, setPage);
            expect(() => service.setLoadedRows(10)).not.toThrow();
        });

        it("skips write when loadedRowsValue attribute is readOnly", () => {
            const attr = new EditableValueBuilder<Big>().isReadOnly().build();
            const service = new PageControlService(makeGate({ loadedRowsValue: attr }), setPageSize, setPage);

            service.setLoadedRows(10);
            expect(attr.setValue).not.toHaveBeenCalled();
        });
    });
});
