import { EditableValue } from "mendix";
import { useEffect, useState } from "react";

interface ActionTimerProps {
    canExecute?: boolean;
    execute?: () => void;
    delay: number | undefined;
    interval: number | undefined;
    repeat: boolean;
    attribute?: EditableValue;
}

export function useActionTimer(props: ActionTimerProps): void {
    const { canExecute, execute, delay, interval, repeat, attribute } = props;
    const [toggleTimer, setToggleTimer] = useState(-1);
    useEffect(() => {
        // If the delay is set to undefined, we should not start a timer.
        if (delay === undefined || delay < 0 || (interval === undefined && repeat)) {
            console.log("Events: Timer delay or interval is not set, skipping timer execution.");
            return;
        }
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [attribute, toggleTimer, delay, interval, canExecute]);
}
