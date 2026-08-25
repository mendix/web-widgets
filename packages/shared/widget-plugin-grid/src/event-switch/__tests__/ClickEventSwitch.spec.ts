import { MouseEvent } from "react";
import { ClickEntry, ClickEventSwitch } from "../ClickEventSwitch";

type Ctx = { name: string };

const ctx: Ctx = { name: "ctx" };

/**
 * A click event as the switch sees it. `detail` is the browser maintained click
 * counter and `timeStamp` is used to recognize clicks coming from one gesture.
 */
function click(detail: number, timeStamp: number): MouseEvent<Element> {
    return { detail, timeStamp } as MouseEvent<Element>;
}

function setup(entries: Array<ClickEntry<Ctx, Element>>): (event: MouseEvent<Element>) => void {
    const entry = new ClickEventSwitch<Ctx, Element>(entries).getClickEntry();
    return event => entry.handler(ctx, event);
}

describe("ClickEventSwitch", () => {
    let onSingle: jest.Mock;
    let onDouble: jest.Mock;
    let dispatch: (event: MouseEvent<Element>) => void;

    beforeEach(() => {
        onSingle = jest.fn();
        onDouble = jest.fn();
        dispatch = setup([
            { eventName: "onClick", handler: onSingle },
            { eventName: "onDoubleClick", handler: onDouble }
        ]);
    });

    describe("classification by detail", () => {
        it("runs the click entries when detail is 1", () => {
            dispatch(click(1, 100));

            expect(onSingle).toHaveBeenCalledTimes(1);
            expect(onDouble).toHaveBeenCalledTimes(0);
        });

        it("runs the double click entries when detail is 2", () => {
            dispatch(click(2, 100));

            expect(onSingle).toHaveBeenCalledTimes(0);
            expect(onDouble).toHaveBeenCalledTimes(1);
        });

        it("ignores clicks that are not produced by a pointer gesture", () => {
            // detail is 0 for keyboard activation and for element.click()
            dispatch(click(0, 100));

            expect(onSingle).toHaveBeenCalledTimes(0);
            expect(onDouble).toHaveBeenCalledTimes(0);
        });

        it("ignores the third and further clicks of a gesture", () => {
            dispatch(click(1, 100));
            dispatch(click(2, 200));
            dispatch(click(3, 300));
            dispatch(click(4, 400));

            expect(onSingle).toHaveBeenCalledTimes(1);
            expect(onDouble).toHaveBeenCalledTimes(1);
        });
    });

    describe("clicks forwarded within one gesture", () => {
        it("runs the click entries once when the same gesture produces two click events", () => {
            // Clicking a <label> makes the browser forward a click to the labelled
            // control. Both events bubble to us with the same detail and timestamp.
            dispatch(click(1, 100));
            dispatch(click(1, 100));

            expect(onSingle).toHaveBeenCalledTimes(1);
            expect(onDouble).toHaveBeenCalledTimes(0);
        });

        it("runs the click entries once when the forwarded click is a fraction of a millisecond later", () => {
            dispatch(click(1, 100));
            dispatch(click(1, 100.1));

            expect(onSingle).toHaveBeenCalledTimes(1);
            expect(onDouble).toHaveBeenCalledTimes(0);
        });

        it("runs the double click entries once when a double click on a label is forwarded", () => {
            dispatch(click(1, 100));
            dispatch(click(1, 100));
            dispatch(click(2, 180));
            dispatch(click(2, 180));

            expect(onSingle).toHaveBeenCalledTimes(1);
            expect(onDouble).toHaveBeenCalledTimes(1);
        });

        it("does not collapse a double click into the click before it", () => {
            dispatch(click(1, 100));
            dispatch(click(2, 100.1));

            expect(onSingle).toHaveBeenCalledTimes(1);
            expect(onDouble).toHaveBeenCalledTimes(1);
        });
    });

    describe("separate gestures", () => {
        it("treats two deliberate clicks as two clicks", () => {
            dispatch(click(1, 100));
            dispatch(click(1, 400));

            expect(onSingle).toHaveBeenCalledTimes(2);
            expect(onDouble).toHaveBeenCalledTimes(0);
        });

        it("keeps counting clicks after a double click", () => {
            dispatch(click(1, 100));
            dispatch(click(2, 180));
            dispatch(click(1, 900));
            dispatch(click(2, 980));

            expect(onSingle).toHaveBeenCalledTimes(2);
            expect(onDouble).toHaveBeenCalledTimes(2);
        });
    });

    describe("entry filters", () => {
        it("skips entries whose filter returns false", () => {
            const passing = jest.fn();
            const blocked = jest.fn();

            dispatch = setup([
                { eventName: "onClick", handler: passing, filter: () => true },
                { eventName: "onClick", handler: blocked, filter: () => false }
            ]);
            dispatch(click(1, 100));

            expect(passing).toHaveBeenCalledTimes(1);
            expect(blocked).toHaveBeenCalledTimes(0);
        });

        it("passes the context and the event to the entry", () => {
            dispatch(click(1, 100));

            expect(onSingle).toHaveBeenCalledWith(ctx, click(1, 100));
        });
    });
});
