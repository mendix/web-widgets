import * as fixtures from "../__fixtures__/fixtures";
import { getEventHandler, InputEvent, Target, Selection, ActionType, Handler } from "../get-event-handler";

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
        (event: InputEvent, target: Target, selection: Selection, action: ActionType, expectedEffect: Handler) => {
            const result = getEventHandler(target, event, selection, action);

            expect(result).toBe(expectedEffect);
        }
    );
});
