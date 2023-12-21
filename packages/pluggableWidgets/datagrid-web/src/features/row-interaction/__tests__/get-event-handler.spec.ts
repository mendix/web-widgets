import * as fixtures from "./fixtures";

type SelectHandler = "select";
type ExecHandler = "execAction";
type Handler = SelectHandler | ExecHandler | "none";
type Target = "cell" | "checkbox";
type Event = "click" | "dblclick" | "shift+click" | "shift+space" | "keyup{enter}" | "keyup{space}";
type Selection = "rowClick" | "checkbox" | "none";
type ActionType = "single" | "double" | "none";
type MatchFn = (event: Event, selection: Selection, action: ActionType) => Handler;

const checkboxEvents = new Set<Event>(["click", "shift+click", "shift+space", "keyup{space}"]);

const cellRules: Record<Event, (selection: Selection, action: ActionType) => Handler> = {
    click: (selection, action) => {
        if (selection === "rowClick") {
            return "select";
        }
        return action === "single" ? "execAction" : "none";
    },
    "shift+click": (selection, action) => {
        if (selection === "rowClick") {
            return "select";
        }
        return action === "single" ? "execAction" : "none";
    },
    "shift+space": selection => (selection !== "none" ? "select" : "none"),
    dblclick: (_, action) => (action === "double" ? "execAction" : "none"),
    "keyup{enter}": (_, action) => (action !== "none" ? "execAction" : "none"),
    "keyup{space}": (_, action) => (action !== "none" ? "execAction" : "none")
};

const targets: Record<Target, MatchFn> = {
    cell(event, selection, action) {
        return cellRules[event](selection, action);
    },
    checkbox(event, selection) {
        if (selection === "checkbox" && checkboxEvents.has(event)) {
            return "select";
        }
        return "none";
    }
};

function getEventHandler(target: Target, event: Event, selection: Selection, action: ActionType): Handler {
    return targets[target](event, selection, action);
}

describe("getEventHandler", () => {
    test.each([
        ...fixtures.clickTests,
        ...fixtures.doubleClickTests,
        ...fixtures.shiftClickTests,
        ...fixtures.shiftSpaceTests,
        ...fixtures.enterKeyupTests,
        ...fixtures.spaceKeyupTests
    ])(
        "Scenario: %s on %s when select: %s and action type: %s should result in %s",
        (event: Event, target: Target, selection: Selection, action: ActionType, expectedEffect: Handler) => {
            // Invoke the function with parameters from the table
            const result = getEventHandler(target, event, selection, action);

            // Check if the actual result matches the expected effect
            expect(result).toBe(expectedEffect);
        }
    );
});
