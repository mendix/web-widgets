import { DerivedPropsGate, SetupComponentHost } from "@mendix/widget-plugin-mobx-kit/main";
import { ListActionValue } from "mendix";
import { autorun } from "mobx";
import { ClickActionHelper, ClickTrigger } from "./ClickActionHelper";

export function createClickActionHelper(
    host: SetupComponentHost,
    gate: DerivedPropsGate<{ onClickTrigger: ClickTrigger; onClick?: ListActionValue }>
): ClickActionHelper {
    const helper = new ClickActionHelper(gate.props.onClickTrigger, gate.props.onClick);

    function setup(): () => void {
        return autorun(() => {
            helper.update(gate.props.onClick);
        });
    }

    host.add({ setup });

    return helper;
}
