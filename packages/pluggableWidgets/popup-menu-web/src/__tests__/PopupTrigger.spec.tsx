import { render, RenderResult } from "@testing-library/react";
import { createElement, PropsWithChildren } from "react";
import { PopupTriggerWithContext as PopupTrigger } from "./PopupTriggerWithContext";

import "@testing-library/jest-dom";

jest.useFakeTimers();

describe("Popup Trigger", () => {
    const createPopupTrigger = (props: PropsWithChildren): RenderResult => render(<PopupTrigger {...props} />);
    const defaultProps: PropsWithChildren = {
        children: createElement("button", null, "Trigger")
    };

    it("renders popup trigger", () => {
        const popupTrigger = createPopupTrigger(defaultProps);

        expect(popupTrigger.asFragment()).toMatchSnapshot();
    });

    describe("has children as prop", () => {
        it("renders the children as the trigger", () => {
            const popupTrigger = createPopupTrigger(defaultProps);
            expect(popupTrigger.getByText("Trigger")).toBeInTheDocument();
        });
    });
});
