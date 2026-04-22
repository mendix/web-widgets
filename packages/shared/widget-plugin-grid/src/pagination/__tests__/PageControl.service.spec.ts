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
    dynamicItemCount?: EditableValue<Big>;
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

        it("does not throw when dynamicPage attribute is not mapped", () => {
            const service = new PageControlService(makeGate(), setPageSize, setPage);
            expect(() => service.setPage(0)).not.toThrow();
        });
    });

    describe("setPageSize", () => {
        it("delegates to setPageSizeAction", () => {
            const service = new PageControlService(makeGate(), setPageSize, setPage);
            service.setPageSize(25);
            expect(setPageSize).toHaveBeenCalledWith(25);
        });

        it("does not throw when dynamicPageSize attribute is not mapped", () => {
            const service = new PageControlService(makeGate(), setPageSize, setPage);
            expect(() => service.setPageSize(10)).not.toThrow();
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

    describe("setItemCount", () => {
        it("writes dynamicItemCount when attribute is mapped", () => {
            const attr = new EditableValueBuilder<Big>().build();
            const service = new PageControlService(makeGate({ dynamicItemCount: attr }), setPageSize, setPage);

            service.setItemCount(77);
            expect(argToNumber(attr.setValue as jest.MockedFunction<any>)).toBe(77);
        });

        it("does not throw when dynamicItemCount attribute is not mapped", () => {
            const service = new PageControlService(makeGate(), setPageSize, setPage);
            expect(() => service.setItemCount(10)).not.toThrow();
        });

        it("skips write when dynamicItemCount attribute is readOnly", () => {
            const attr = new EditableValueBuilder<Big>().isReadOnly().build();
            const service = new PageControlService(makeGate({ dynamicItemCount: attr }), setPageSize, setPage);

            service.setItemCount(10);
            expect(attr.setValue).not.toHaveBeenCalled();
        });
    });
});
