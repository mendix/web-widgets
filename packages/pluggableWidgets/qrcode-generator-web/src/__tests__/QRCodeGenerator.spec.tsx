import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { createElement } from "react";

import QRCodeGenerator from "../QRCodeGenerator";

describe("QRCodeGenerator", () => {
    it("renders the basic structure", () => {
        const props = {
            name: "qrCodeGenerator1",
            class: "mx-qrcode-generator",
            tabIndex: -1,
            valueAttribute: {
                value: "Hello World"
            } as any
        };

        render(<QRCodeGenerator {...props} />);

        expect(screen.getByText("QR Code Generator")).toBeInTheDocument();
        expect(screen.getByText("Value: Hello World")).toBeInTheDocument();
    });

    it("handles empty value", () => {
        const props = {
            name: "qrCodeGenerator1",
            class: "mx-qrcode-generator",
            tabIndex: -1,
            valueAttribute: {
                value: undefined
            } as any
        };

        render(<QRCodeGenerator {...props} />);

        expect(screen.getByText("Value: No value")).toBeInTheDocument();
    });

    it("applies CSS classes correctly", () => {
        const props = {
            name: "qrCodeGenerator1",
            class: "mx-qrcode-generator",
            tabIndex: -1,
            valueAttribute: {
                value: "test"
            } as any
        };

        const { container } = render(<QRCodeGenerator {...props} />);

        expect(container.firstChild).toHaveClass("mx-qrcode-generator");
        expect(container.querySelector(".qr-code-generator")).toBeInTheDocument();
    });
});
