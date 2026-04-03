import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { ReactElement } from "react";
import { SignatureContainerProps } from "../../typings/SignatureProps";
import Signature from "../Signature";

const mockSignatureComponent = jest.fn((_props: unknown) => <div data-testid="signature-component" />);

jest.mock("../components/Signature", () => ({
    SignatureComponent: (props: unknown): ReactElement => mockSignatureComponent(props)
}));

describe("Signature", () => {
    const imageSource = {
        setValue: jest.fn()
    } as unknown as SignatureContainerProps["imageSource"];

    const defaultProps: SignatureContainerProps = {
        name: "signature",
        class: "mx-signature",
        tabIndex: 0,
        imageSource,
        hasSignatureAttribute: undefined,
        penType: "ballpoint",
        penColor: "#000000",
        widthUnit: "pixels",
        width: 300,
        heightUnit: "pixels",
        height: 200,
        minHeightUnit: "none",
        minHeight: 0,
        maxHeightUnit: "none",
        maxHeight: 0,
        overflowY: "auto",
        showGrid: true,
        gridBorderColor: "#cccccc",
        gridCellHeight: 20,
        gridCellWidth: 20,
        gridBorderWidth: 1
    };

    beforeEach(() => {
        mockSignatureComponent.mockClear();
    });

    it("renders SignatureComponent", () => {
        render(<Signature {...defaultProps} />);

        expect(screen.getByTestId("signature-component")).toBeInTheDocument();
    });

    it("passes derived and default props to SignatureComponent", () => {
        render(<Signature {...defaultProps} />);

        expect(mockSignatureComponent).toHaveBeenCalledTimes(1);
        expect(mockSignatureComponent.mock.calls[0][0]).toEqual(
            expect.objectContaining({
                ...defaultProps,
                className: defaultProps.class,
                imageSource
            })
        );
    });
});
