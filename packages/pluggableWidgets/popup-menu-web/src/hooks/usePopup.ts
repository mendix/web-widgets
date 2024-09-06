import {
    autoUpdate,
    flip,
    offset,
    Placement,
    safePolygon,
    shift,
    useClick,
    useDismiss,
    useFloating,
    useHover,
    useInteractions,
    useRole
} from "@floating-ui/react";
import { useMemo, useState } from "react";
import { TriggerEnum } from "../../typings/PopupMenuProps";

interface PopupOptions {
    initialOpen?: boolean;
    placement?: Placement;
    modal?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function usePopup(
    {
        initialOpen = false,
        placement = "bottom",
        modal,
        open: controlledOpen,
        onOpenChange: setControlledOpen
    }: PopupOptions = {},
    trigger: TriggerEnum
) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen);
    const [labelId, setLabelId] = useState<string | undefined>();
    const [descriptionId, setDescriptionId] = useState<string | undefined>();

    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = setControlledOpen ?? setUncontrolledOpen;

    const data = useFloating({
        placement,
        open,
        onOpenChange: setOpen,
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(5),
            flip({
                crossAxis: placement.includes("-"),
                fallbackAxisSideDirection: "end",
                padding: 5
            }),
            shift({ padding: 5 })
        ]
    });

    const context = data.context;
    const dismiss = useDismiss(context);
    const role = useRole(context);

    const propsList = [dismiss, role];

    if (trigger === "onclick") {
        const click = useClick(context, {
            enabled: controlledOpen == null
        });
        propsList.push(click);
    }
    if (trigger === "onhover") {
        const hover = useHover(context, { handleClose: safePolygon() });
        propsList.push(hover);
    }

    const interactions = useInteractions(propsList);

    return useMemo(
        () => ({
            open,
            setOpen,
            ...interactions,
            ...data,
            modal,
            labelId,
            descriptionId,
            setLabelId,
            setDescriptionId
        }),
        [open, setOpen, interactions, data, modal, labelId, descriptionId]
    );
}
