import { useEffect, useState } from "react";
import { EditableValue, ListValue } from "mendix";

interface ActionTimerProps {
    canExecute?: boolean;
    execute?: () => void;
    delay: number;
    interval: number;
    repeat: boolean;
    attribute: Array<EditableValue | ListValue | undefined>;
}

export function useActionTimer(props: ActionTimerProps) {
    const { canExecute, execute, delay, interval, repeat, attribute } = props;
    const [toggleTimer, setToggleTimer] = useState(-1);
    useEffect(() => {
        let counter: NodeJS.Timeout;
        if (canExecute) {
            if (repeat) {
                counter = setInterval(
                    () => {
                        execute?.call(attribute);

                        if (toggleTimer < 0) {
                            // this will clear delay timer and switch to interval timer.
                            setToggleTimer(1);
                        }
                    },
                    toggleTimer < 0 ? delay : interval
                );
            } else {
                counter = setTimeout(() => {
                    execute?.call(attribute);
                }, delay);
            }
        }

        return () => {
            clearInterval(counter);
            clearTimeout(counter);
        };
    }, [...attribute, toggleTimer, delay, interval]);
}
