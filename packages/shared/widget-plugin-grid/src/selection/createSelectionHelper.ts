import { DerivedPropsGate, disposeBatch, SetupComponentHost } from "@mendix/widget-plugin-mobx-kit/main";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { ObjectItem, SelectionMultiValue, SelectionSingleValue } from "mendix";
import { autorun, comparer, reaction } from "mobx";
import { SelectionHelperService } from "../interfaces/SelectionHelperService";
import { SelectionDynamicProps } from "../main";
import { MultiSelectionHelper, SingleSelectionHelper } from "./helpers";

export function createSelectionHelper(
    host: SetupComponentHost,
    gate: DerivedPropsGate<SelectionDynamicProps>,
    config: { keepSelection: boolean; autoSelect: boolean } = { keepSelection: false, autoSelect: false }
): SelectionHelperService {
    const { selection, datasource } = gate.props;

    let helper: SelectionHelperService | null = null;

    if (!selection) {
        return null;
    }

    if (selection.type === "Multi") {
        helper = new MultiSelectionHelper(selection, datasource.items ?? []);
    } else if (selection.type === "Single") {
        helper = new SingleSelectionHelper(selection);
    }
    if (config.keepSelection) {
        selection?.setKeepSelection(() => true);
    }

    function setup(): (() => void) | void {
        const [add, disposeAll] = disposeBatch();

        if (!helper) return;

        add(
            autorun(() => {
                const { selection, datasource } = gate.props;
                if (helper instanceof MultiSelectionHelper) {
                    helper.updateProps(selection as SelectionMultiValue, datasource.items ?? []);
                }
                if (helper instanceof SingleSelectionHelper) {
                    helper.updateProps(selection as SelectionSingleValue);
                }
            })
        );

        if (gate.props.onSelectionChange) {
            const cleanup = reaction(
                (): ObjectItem[] => {
                    const selected = gate.props.selection!.selection;
                    if (Array.isArray(selected)) return selected;
                    if (selected !== undefined) return [selected];
                    return [];
                },
                () => executeAction(gate.props.onSelectionChange),
                { equals: comparer.structural }
            );
            add(cleanup);
        }
        if (helper.type === "Single" && config.autoSelect) {
            const dispose = autorun(() => {
                const { datasource, selection } = gate.props;
                const firstItem = datasource.items?.[0];

                if (datasource.status === "available") {
                    if (firstItem && !selection?.selection) {
                        setTimeout(() => {
                            if (!gate.props.selection?.selection) {
                                (gate.props.selection as SelectionSingleValue)?.setSelection(firstItem);
                            }
                        }, 0);
                    }
                    dispose();
                }
            });
            add(dispose);
        }
        return disposeAll;
    }

    host.add({ setup });

    return helper;
}
