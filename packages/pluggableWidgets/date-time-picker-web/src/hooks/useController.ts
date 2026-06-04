import { ActionValue, Option } from "mendix";
import { useEffect, useState } from "react";
import { TypeEnum } from "typings/DateTimePickerProps";
import { DatePickerController } from "../helpers/DatePickerController";

type UseControllerProps = {
    endDate?: Date;
    onChange?: ActionValue<{ startDate: Option<Date>; endDate: Option<Date> }>;
    startDate?: Date;
    type: TypeEnum;
};

export function useController({ endDate, startDate, type, onChange }: UseControllerProps): DatePickerController {
    const [controller] = useState(
        () =>
            new DatePickerController({
                defaultEnd: endDate,
                defaultStart: startDate,
                type,
                onChange
            })
    );

    useEffect(() => controller.setup(), [controller]);

    return controller;
}
