type InferEvent<T> = T extends React.EventHandler<infer E> ? E : never;

export type EventName = keyof Omit<React.DOMAttributes<unknown>, "children" | "dangerouslySetInnerHTML">;

export type EventCaseEntry<
    Element extends keyof JSX.IntrinsicElements,
    Context,
    EName extends EventName = EventName,
    Event = InferEvent<JSX.IntrinsicElements[Element][EName]>
> = {
    eventName: EName;
    handler(ctx: Context, event: Event): void;
    filter?(ctx: Context, event: Event): boolean;
};
