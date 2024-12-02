import { createElement, useCallback } from "react";

interface SelectControlProps {
    triggerProps: JSX.IntrinsicElements["button"];
    children: React.ReactNode;
    clearProps: JSX.IntrinsicElements["button"];
    classNames?: {
        root?: string;
        trigger?: string;
        clear?: string;
    };
}

const defaultClasses = { root: "form-control select-control", trigger: "trigger", clear: "clear" };

export function SelectControl(props: SelectControlProps): React.ReactElement {
    const { children, triggerProps, clearProps } = props;
    const classes = { ...defaultClasses, ...props.classNames };
    const onClearClick = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            props.clearProps.onClick?.(event);
            if (event.currentTarget.previousSibling?.nodeName.toLowerCase() === "button") {
                (event.currentTarget.previousSibling as HTMLButtonElement).focus();
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [props.clearProps.onClick]
    );

    return (
        <div className={classes.root}>
            <button {...triggerProps} className={classes.trigger} type="button">
                {children}
                <span aria-hidden>&#8595;</span>
            </button>
            <button className={classes.clear} tabIndex={-1} {...clearProps} onClick={onClearClick} type="button">
                x
            </button>
        </div>
    );
}
