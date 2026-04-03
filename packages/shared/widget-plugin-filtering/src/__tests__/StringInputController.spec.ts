import { describe, expect, it, jest } from "@jest/globals";
import { StringFilterController } from "../controllers/input/StringInputController";
import { String_InputFilterInterface } from "../typings/InputFilterInterface";

describe("StringFilterController", () => {
    function createFilter(): String_InputFilterInterface {
        return {
            storeType: "input",
            filterFunction: "equal",
            defaultState: ["equal"],
            arg1: {
                type: "string",
                value: undefined,
                displayValue: "initial",
                isValid: true
            },
            arg2: {
                type: "string",
                value: undefined,
                displayValue: "",
                isValid: true
            },
            reset: jest.fn(),
            clear: jest.fn(),
            UNSAFE_overwriteFilterFunction: jest.fn(),
            UNSAFE_setDefaults: jest.fn()
        };
    }

    it("focuses input for value-based operators", () => {
        const controller = new StringFilterController({
            filter: createFilter(),
            defaultFilter: "equal",
            adjustableFilterFunction: true
        });

        const focus = jest.fn();
        Object.defineProperty(controller.inputRef, "current", {
            value: { focus },
            writable: true
        });

        controller.handleFilterFnChange("contains");

        expect(focus).toHaveBeenCalledTimes(1);
    });

    it("does not focus input and clears value for empty", () => {
        const controller = new StringFilterController({
            filter: createFilter(),
            defaultFilter: "equal",
            adjustableFilterFunction: true
        });

        const focus = jest.fn();
        Object.defineProperty(controller.inputRef, "current", {
            value: { focus },
            writable: true
        });

        controller.handleFilterFnChange("empty");

        expect(controller.input1.value).toBe("");
        expect(focus).not.toHaveBeenCalled();
    });

    it("does not focus input and clears value for notEmpty", () => {
        const controller = new StringFilterController({
            filter: createFilter(),
            defaultFilter: "equal",
            adjustableFilterFunction: true
        });

        const focus = jest.fn();
        Object.defineProperty(controller.inputRef, "current", {
            value: { focus },
            writable: true
        });

        controller.handleFilterFnChange("notEmpty");

        expect(controller.input1.value).toBe("");
        expect(focus).not.toHaveBeenCalled();
    });
});
