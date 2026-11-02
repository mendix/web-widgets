import classNames from "classnames";
import { ReactElement } from "react";
import { classes } from "./classes";
import { legacy } from "./legacyModifiers";

type SkeletonLoaderProps = {
    withCheckbox?: boolean;
};

export function SkeletonLoader({ withCheckbox = false }: SkeletonLoaderProps): ReactElement {
    return (
        <div className={classes.skeleton}>
            {withCheckbox && (
                <span className={classNames(classes.skeletonBar, legacy.skeletonSmall)} data-size="small" />
            )}
            <span className={classes.skeletonBar} />
        </div>
    );
}
