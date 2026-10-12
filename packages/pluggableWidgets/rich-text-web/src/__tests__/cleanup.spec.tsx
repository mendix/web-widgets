import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import { EditableValueBuilder } from "@mendix/widget-plugin-test-utils";
import { RichTextContainerProps, StatusBarContentEnum } from "../../typings/RichTextProps";
import { IMAGE_DROP_ERROR_EVENT, IMAGE_REQUEST_EVENT } from "../extensions/ImagePasteDrop";
import RichText from "../RichText";

function buildProps(): RichTextContainerProps {
    return {
        name: "RichText",
        id: "RichText1",
        stringAttribute: new EditableValueBuilder<string>().withValue("<p>text</p>").build(),
        preset: "full",
        toolbarLocation: "top",
        widthUnit: "percentage",
        width: 100,
        heightUnit: "percentageOfWidth",
        height: 75,
        toolbarConfig: "basic",
        history: true,
        fontStyle: true,
        fontScript: true,
        fontColor: true,
        code: true,
        indent: true,
        embed: true,
        align: true,
        list: true,
        remove: true,
        header: true,
        view: true,
        tableBetter: false,
        helpButton: true,
        advancedConfig: [],
        readOnlyStyle: "text",
        tabIndex: 0,
        onChangeType: "onLeave",
        enableStatusBar: true,
        dialogStyle: "inline",
        statusBarContent: "wordCount" as StatusBarContentEnum,
        spellCheck: true,
        minHeightUnit: "none",
        maxHeightUnit: "none",
        maxHeight: 0,
        minHeight: 75,
        OverflowY: "auto",
        customFonts: [],
        enableDefaultUpload: true,
        linkValidation: true,
        styleDataFormat: "inline"
    };
}

function getProseMirror(container: HTMLElement): HTMLElement {
    return container.querySelector(".ProseMirror") as HTMLElement;
}

// Contract: the custom DOM-event listeners that Editor (drop errors) and Toolbar (image
// requests) attach to the ProseMirror element are detached with the same handler on unmount.
describe("RichText listener cleanup on unmount", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it.each([
        ["Editor", IMAGE_DROP_ERROR_EVENT],
        ["Toolbar", IMAGE_REQUEST_EVENT]
    ])("%s removes its %s listener from the editor DOM", (_owner, eventName) => {
        const addSpy = jest.spyOn(EventTarget.prototype, "addEventListener");
        const removeSpy = jest.spyOn(EventTarget.prototype, "removeEventListener");

        const { container, unmount } = render(<RichText {...buildProps()} />);
        const dom = getProseMirror(container);

        const added = addSpy.mock.calls
            .map((call, i) => ({ type: call[0], handler: call[1], target: addSpy.mock.contexts[i] }))
            .filter(({ type, target }) => type === eventName && target === dom);
        expect(added.length).toBeGreaterThan(0);

        unmount();

        const removed = removeSpy.mock.calls
            .map((call, i) => ({ type: call[0], handler: call[1], target: removeSpy.mock.contexts[i] }))
            .filter(({ type, target }) => type === eventName && target === dom);

        for (const { handler } of added) {
            expect(removed.map(r => r.handler)).toContain(handler);
        }
    });
});

// Contract: a rejected image drop/paste (reported by ImagePasteDrop as a DOM event on the
// editor element) is shown as a status message that disappears after 5 seconds.
describe("RichText drop-error status", () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    it("shows a status message on drop error and hides it after 5000ms", () => {
        const { container } = render(<RichText {...buildProps()} />);
        const dom = getProseMirror(container);

        jest.useFakeTimers();
        act(() => {
            dom.dispatchEvent(new CustomEvent(IMAGE_DROP_ERROR_EVENT, { detail: { key: "image.errorNotImage" } }));
        });

        const status = screen.getByRole("status");
        expect(status).toHaveTextContent("Only image files are allowed");

        act(() => {
            jest.advanceTimersByTime(4999);
        });
        expect(screen.getByRole("status")).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(1);
        });
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
});
