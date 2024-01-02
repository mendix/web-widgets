import { EventCaseEntry } from "./base";

export function useEventSwitch<Element extends keyof JSX.IntrinsicElements, Context>(
    _contextFn: () => Context,
    _cases: Array<EventCaseEntry<Element, Context>>
): React.DOMAttributes<HTMLDivElement> {
    return {};
}
