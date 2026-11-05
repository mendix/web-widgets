import classNames from "classnames";
import { ReactElement } from "react";
import { legacy } from "./legacyModifiers";
import { useComboboxClasses } from "../hooks/useComboboxClasses";

type SkeletonLoaderProps = {
    withCheckbox?: boolean;
};

export function SkeletonLoader({ withCheckbox = false }: SkeletonLoaderProps): ReactElement {
    const classes = useComboboxClasses();
    return (
        <div className={classes.skeleton}>
            {withCheckbox && (
                <span className={classNames(classes.skeletonBar, legacy.skeletonSmall)} data-size="small" />
            )}
            <span className={classes.skeletonBar} />
        </div>
    );
}
