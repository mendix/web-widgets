import { Container } from "brandi";
import { ContainerProvider } from "brandi-react";
import { PropsWithChildren, ReactNode } from "react";
import { useConst } from "@mendix/widget-plugin-mobx-kit/react/useConst";
import { GridColumn } from "./GridColumn";
import { COLUMNS_TOKENS as COLUMNS } from "./tokens";

/** Provider to bind & provider column store for children at runtime. */
export function ColumnProvider(props: PropsWithChildren<{ column: GridColumn }>): ReactNode {
    const ct = useConst(() => {
        const container = new Container();
        container.bind(COLUMNS.column).toConstant(props.column);
        return container;
    });

    return <ContainerProvider container={ct}>{props.children}</ContainerProvider>;
}
