import { EditableValue } from "mendix";
import { useEffect, useState } from "react";
import { TimerExecutor } from "../helpers/TimerExecutor";

interface UseOnLoadTimerProps {
    canExecute: boolean;
    execute?: () => void;
    delay: number | undefined;
    interval: number | undefined;
    repeat: boolean;
    attribute?: EditableValue;
}

export function useOnLoadTimer(props: UseOnLoadTimerProps): void {
    const { canExecute, execute, delay, interval, repeat, attribute } = props;

    const [timerExecutor] = useState(() => new TimerExecutor());

    // update callback props
    useEffect(() => {
        timerExecutor.setCallback(() => execute?.call(attribute), canExecute);
    }, [timerExecutor, execute, attribute, canExecute]);

    // update interval props
    useEffect(() => {
        timerExecutor.setParams(delay, interval, repeat);
        return () => {
            timerExecutor.stop();
        };
    }, [timerExecutor, delay, interval, repeat]);
}
