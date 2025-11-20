import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { ContainerProvider } from "brandi-react";
import { createDatagridContainer } from "../../model/containers/createDatagridContainer";
import { CORE_TOKENS as CORE } from "../../model/tokens";
import { mockContainerProps } from "../../utils/test-utils";
import { ColumnProvider } from "../ColumnProvider";
import { ColumnResizer } from "../ColumnResizer";

describe("Column Resizer", () => {
    it("renders the structure correctly", () => {
        const props = mockContainerProps();
        const [container] = createDatagridContainer(props);
        const columnsStore = container.get(CORE.columnsStore);
        const column = columnsStore.visibleColumns[0];

        const component = render(
            <ContainerProvider container={container}>
                <ColumnProvider column={column}>
                    <ColumnResizer />
                </ColumnProvider>
            </ContainerProvider>
        );

        expect(component).toMatchSnapshot();
    });
});
