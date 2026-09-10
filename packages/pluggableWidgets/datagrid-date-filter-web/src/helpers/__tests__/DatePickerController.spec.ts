import { AttributeMetaData } from "mendix";
import { runInAction } from "mobx";
import { DateInputFilterStore } from "@mendix/widget-plugin-filtering/stores/input/DateInputFilterStore";
import { Date_InputFilterInterface } from "@mendix/widget-plugin-filtering/typings/InputFilterInterface";
import { ListAttributeValueBuilder } from "@mendix/widget-plugin-test-utils";
import { DatePickerController } from "../DatePickerController";

function setup(defaultFilter: "equal" | "between" = "equal"): {
    controller: DatePickerController;
    filter: Date_InputFilterInterface;
} {
    const attribute = new ListAttributeValueBuilder()
        .withType("DateTime")
        .withFilterable(true)
        .build() as unknown as AttributeMetaData<Date>;
    const filter = new DateInputFilterStore([attribute], null);
    const controller = new DatePickerController({
        filter,
        defaultFilter,
        adjustableFilterFunction: true
    });
    controller.setup();

    return { controller, filter };
}

describe("DatePickerController", () => {
    describe("handlePickerChange", () => {
        it("maps a single date onto arg1 and leaves arg2 untouched", () => {
            const { controller, filter } = setup();
            const date = new Date("2021-12-10");

            runInAction(() => controller.handlePickerChange(date));

            expect(filter.arg1.value).toBe(date);
            expect(filter.arg2.value).toBeUndefined();
        });

        it("maps a range tuple onto arg1 and arg2", () => {
            const { controller, filter } = setup("between");
            const start = new Date("2021-12-10");
            const end = new Date("2021-12-24");

            runInAction(() => controller.handlePickerChange([start, end]));

            expect(filter.arg1.value).toBe(start);
            expect(filter.arg2.value).toBe(end);
        });

        it("maps a half-open range tuple onto arg1 only", () => {
            const { controller, filter } = setup("between");
            const start = new Date("2021-12-10");

            runInAction(() => controller.handlePickerChange([start, null]));

            expect(filter.arg1.value).toBe(start);
            expect(filter.arg2.value).toBeUndefined();
        });

        it("clears both arguments on null", () => {
            const { controller, filter } = setup("between");

            runInAction(() => controller.handlePickerChange([new Date("2021-12-10"), new Date("2021-12-24")]));
            runInAction(() => controller.handlePickerChange(null));

            expect(filter.arg1.value).toBeUndefined();
            expect(filter.arg2.value).toBeUndefined();
        });
    });

    describe("pickerState", () => {
        it("routes arg1 to `selected` outside of range mode", () => {
            const { controller } = setup();
            const date = new Date("2021-12-10");

            runInAction(() => controller.handlePickerChange(date));

            expect(controller.pickerState).toMatchObject({
                selected: date,
                selectsRange: false,
                startDate: undefined,
                endDate: undefined
            });
        });

        it("routes arg1 and arg2 to `startDate` and `endDate` in range mode", () => {
            const { controller, filter } = setup("between");
            const start = new Date("2021-12-10");
            const end = new Date("2021-12-24");

            runInAction(() => controller.handlePickerChange([start, end]));

            expect(controller.pickerState).toMatchObject({
                selected: undefined,
                selectsRange: true,
                startDate: start,
                endDate: end
            });
            expect(filter.filterFunction).toBe("between");
        });

        it.each(["empty", "notEmpty"] as const)("disables the picker for the %p filter function", fn => {
            const { controller } = setup();

            runInAction(() => controller.handleFilterChange(fn));

            expect(controller.pickerState.disabled).toBe(true);
        });
    });
});
