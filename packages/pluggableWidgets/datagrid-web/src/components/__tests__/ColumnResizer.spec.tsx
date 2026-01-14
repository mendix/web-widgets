import { render } from "@testing-library/react";
import { ColumnResizer } from "../ColumnResizer";

describe("Column Resizer", () => {
    it("renders the structure correctly", () => {
        const component = render(<ColumnResizer setColumnWidth={jest.fn()} />);

        expect(component).toMatchSnapshot();
    });
});
