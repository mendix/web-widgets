import { MouseEvent } from "react";
import { ClickEntry, ClickEventSwitch } from "../ClickEventSwitch";

type Ctx = { name: string };

const ctx: Ctx = { name: "ctx" };

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

    describe("classification", () => {
        it("runs the click entries for a single click", () => {
            dispatch(click(1, 100));

            expect(onSingle).toHaveBeenCalledTimes(1);
            expect(onDouble).toHaveBeenCalledTimes(0);
        });

        it("runs the double click entries for a double click", () => {
            dispatch(click(1, 100));
            dispatch(click(2, 250));

            expect(onSingle).toHaveBeenCalledTimes(1);
            expect(onDouble).toHaveBeenCalledTimes(1);
        });

        it("runs the double click entries for a double tap that reports detail 1 for both taps", () => {
            dispatch(click(1, 100));
            dispatch(click(1, 250));

            expect(onSingle).toHaveBeenCalledTimes(1);
            expect(onDouble).toHaveBeenCalledTimes(1);
        });

        it("runs the click entries for a click without a pointer", () => {
            dispatch(click(0, 100));

            expect(onSingle).toHaveBeenCalledTimes(1);
            expect(onDouble).toHaveBeenCalledTimes(0);
        });
    });

    describe("clicks forwarded within one gesture", () => {
        it("runs the click entries once when the same gesture produces two click events", () => {
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

        it("runs the click entries once when a click without a pointer is forwarded", () => {
            dispatch(click(0, 100));
            dispatch(click(0, 100));

            expect(onSingle).toHaveBeenCalledTimes(1);
            expect(onDouble).toHaveBeenCalledTimes(0);
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
            dispatch(click(1, 500));

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
