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

describe("PageControlService", () => {
    let gate: DerivedPropsGate<GateProps>;
    let setPage: jest.MockedFunction<SetPageAction>;
    let setPageSize: jest.MockedFunction<SetPageSizeAction>;
    let service: PageControlService;

    beforeEach(() => {
        gate = {
            props: {},
            previousProps: {},
            version: 0
        } as unknown as DerivedPropsGate<GateProps>;
        setPage = jest.fn();
        setPageSize = jest.fn();
        service = new PageControlService(gate, setPageSize, setPage);
    });

    it("delegates setPageSize and mirrors mapped page size attribute", () => {
        const attr = new EditableValueBuilder<Big>().build();
        gate.props.dynamicPageSize = attr;

        service.setPageSize(42);
        expect(setPageSize).toHaveBeenCalledWith(42);
        expect(attr.setValue).toHaveBeenCalledWith(new Big(42));
    });

    it("delegates setPage and mirrors mapped page attribute", () => {
        const attr = new EditableValueBuilder<Big>().build();
        gate.props.dynamicPage = attr;

        service.setPage(3);
        expect(setPage).toHaveBeenCalledWith(3);
        expect(attr.setValue).toHaveBeenCalledWith(new Big(4));
    });

    it("writes totalCountValue when attribute is mapped", () => {
        const attr = new EditableValueBuilder<Big>().build();
        gate.props.totalCountValue = attr;

        service.setTotalCount(123);
        expect(attr.setValue).toHaveBeenCalledWith(new Big(123));
    });

    it("skips totalCount write when attribute is missing", () => {
        expect(() => service.setTotalCount(5)).not.toThrow();
    });
});
