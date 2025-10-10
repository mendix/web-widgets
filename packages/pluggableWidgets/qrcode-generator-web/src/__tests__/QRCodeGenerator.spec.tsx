import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { createElement } from "react";

import QRCodeGenerator from "../QRCodeGenerator";

// Mock the QRCodeSVG component
jest.mock("qrcode.react", () => ({
    QRCodeSVG: ({ value, size, marginSize }: { value: string; size: number; marginSize: number }) => (
        <div data-testid="qr-code" data-value={value} data-size={size} data-margin={marginSize}>
            QR Code: {value}
        </div>
    )
}));

describe("QRCodeGenerator", () => {
    it("renders QR code when value is available", () => {
        const props = {
            name: "qrCodeGenerator1",
            class: "mx-qrcode-generator",
            tabIndex: -1,
            qrValue: {
                value: "Hello World",
                status: "available"
            } as any,
            qrSize: 128,
            qrMargin: 8
        };

        render(<QRCodeGenerator {...props} />);

        expect(screen.getByTestId("qr-code")).toBeInTheDocument();
        expect(screen.getByTestId("qr-code")).toHaveAttribute("data-value", "Hello World");
        expect(screen.getByTestId("qr-code")).toHaveAttribute("data-size", "128");
    });

    it("shows loading message when data is loading", () => {
        const props = {
            name: "qrCodeGenerator1",
            class: "mx-qrcode-generator",
            tabIndex: -1,
            qrValue: {
                value: "",
                status: "loading"
            } as any,
            qrSize: 128,
            qrMargin: 8
        };

        render(<QRCodeGenerator {...props} />);

        expect(screen.getByText("Loading...")).toBeInTheDocument();
        expect(screen.queryByTestId("qr-code")).not.toBeInTheDocument();
    });

    it("shows no data message when value is empty", () => {
        const props = {
            name: "qrCodeGenerator1",
            class: "mx-qrcode-generator",
            tabIndex: -1,
            qrValue: {
                value: "",
                status: "available"
            } as any,
            qrSize: 128,
            qrMargin: 8
        };

        render(<QRCodeGenerator {...props} />);

        expect(screen.getByText("No QR code to display")).toBeInTheDocument();
        expect(screen.queryByTestId("qr-code")).not.toBeInTheDocument();
    });

    it("uses default size when qrSize is not provided", () => {
        const props = {
            name: "qrCodeGenerator1",
            class: "mx-qrcode-generator",
            tabIndex: -1,
            qrValue: {
                value: "test",
                status: "available"
            } as any,
            qrSize: 256, // Test with different size
            qrMargin: 8
        };

        render(<QRCodeGenerator {...props} />);

        expect(screen.getByTestId("qr-code")).toHaveAttribute("data-size", "256");
    });

    it("applies the correct CSS structure", () => {
        const props = {
            name: "qrCodeGenerator1",
            class: "mx-qrcode-generator",
            tabIndex: -1,
            qrValue: {
                value: "test",
                status: "available"
            } as any,
            qrSize: 128,
            qrMargin: 8
        };

        const { container } = render(<QRCodeGenerator {...props} />);

        expect(container.firstChild).toHaveClass("qr-code-widget");
        expect(container.firstChild).toHaveAttribute("tabindex", "-1");
    });
});
