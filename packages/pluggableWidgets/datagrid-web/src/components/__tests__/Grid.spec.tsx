import { render } from "@testing-library/react";
import { ContainerProvider } from "brandi-react";
import { createDatagridContainer } from "../../model/containers/createDatagridContainer";
import { mockContainerProps } from "../../utils/test-utils";
import { Grid } from "../Grid";

describe("Grid", () => {
    it("renders without crashing", () => {
        const props = mockContainerProps();
        const [container] = createDatagridContainer(props);
        const { asFragment } = render(
            <ContainerProvider container={container}>
                <Grid>Test</Grid>
            </ContainerProvider>
        );

        expect(asFragment()).toMatchSnapshot();
    });

    it("renders without selector column", () => {
        const [container] = createDatagridContainer({
            ...mockContainerProps(),
            columnsHidable: false
        });
        const { asFragment } = render(
            <ContainerProvider container={container}>
                <Grid>Test</Grid>
            </ContainerProvider>
        );

        expect(asFragment()).toMatchSnapshot();
    });
});
