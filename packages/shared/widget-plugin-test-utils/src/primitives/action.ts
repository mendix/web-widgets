import { ActionValue } from "mendix";

/**
 * Returns `ActionValue` mock.
 * @typeParam T - the action type to mock, for actions with parameters:
 * `actionValue<ActionValue<{ filterInput: string | undefined }>>()`.
 */
export function actionValue<T extends ActionValue<any> = ActionValue>(canExecute = true, isExecuting = false): T {
    return { canExecute, isExecuting, execute: jest.fn() } as unknown as T;
}
