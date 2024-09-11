import { render } from "@testing-library/react";
import { createElement } from "react";
import ReactDOM from "react-dom";
import { FilterComponent, FilterComponentProps } from "../FilterComponent";

const commonProps: FilterComponentProps = {
    adjustable: true,
    class: "",
    filterFn: "equal",
    onChange: jest.fn(),
    onFilterChange: jest.fn(),
    expanded: false,
    tabIndex: 0
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

        expect(component.asFragment()).toMatchSnapshot();
    });

    it("renders correctly when not adjustable by user", () => {
        const component = render(<FilterComponent {...commonProps} adjustable={false} />);

        expect(component.asFragment()).toMatchSnapshot();
    });

    it("renders correctly with aria labels", () => {
        const component = render(
            <FilterComponent
                {...commonProps}
                screenReaderButtonCaption="my label"
                screenReaderInputCaption="my label"
            />
        );

        expect(component.asFragment()).toMatchSnapshot();
    });
});
