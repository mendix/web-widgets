import { render } from "enzyme";
import { createElement } from "react";
import { FilterComponent, FilterComponentProps } from "../FilterComponent";
import ReactDOM from "react-dom";

const commonProps: FilterComponentProps = {
    widgetName: "DateFilter",
    adjustable: true,
    filterAPIClient: null,
    syncChannel: null,
    class: "",
    tabIndex: 0,
    initValues: {
        type: "equal",
        value: null,
        startDate: null,
        endDate: null
    }
};

describe("Filter component", () => {
    beforeAll(() => {
        jest.spyOn(global.Math, "random").mockReturnValue(0.123456789);

        jest.spyOn(ReactDOM, "createPortal").mockImplementation((element, _node, _key) => {
            return element as ReturnType<typeof ReactDOM.createPortal>;
        });
    });

    it("renders correctly", () => {
        const component = render(<FilterComponent {...commonProps} />);

        expect(component).toMatchSnapshot();
    });

    it("renders correctly when not adjustable by user", () => {
        const component = render(<FilterComponent {...commonProps} adjustable={false} />);

        expect(component).toMatchSnapshot();
    });

    it("renders correctly with aria labels", () => {
        const component = render(
            <FilterComponent
                {...commonProps}
                screenReaderButtonCaption="my label"
                screenReaderInputCaption="my label"
            />
        );

        expect(component).toMatchSnapshot();
    });
});
