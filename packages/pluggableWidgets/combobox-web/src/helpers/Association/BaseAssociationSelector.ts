import { ObjectItem, ReferenceSetValue, ReferenceValue } from "mendix";
import { computed, makeObservable } from "mobx";
import { DerivedPropsGate, MappedGate, SetupComponentHost } from "@mendix/widget-plugin-mobx-kit/main";
import { ComboboxConfig } from "../../core/Combobox.config";
import { ComboboxGateProps } from "../../core/ComboboxGate";
import { CaptionSource, DatasourceCaptionsProvider } from "../DatasourceCaptionsProvider";
import { DatasourceOptionsProvider, DatasourceSource } from "../DatasourceOptionsProvider";
import { Status } from "../types";
import { required } from "../utils";

export type AssociationGateProps = Pick<
    ComboboxGateProps,
    | "attributeAssociation"
    | "optionsSourceAssociationDataSource"
    | "optionsSourceAssociationCaptionAttribute"
    | "optionsSourceAssociationCaptionExpression"
    | "optionsSourceAssociationCustomContent"
    | "emptyOptionText"
>;

function selectedItems(attr: ReferenceValue | ReferenceSetValue): ObjectItem[] {
    return attr.value === undefined ? [] : Array.isArray(attr.value) ? attr.value : [attr.value];
}

/**
 * A selector over a reference or reference set: the value is the association, the options come
 * from its datasource. Everything is derived from the gate; `setValue` writes to the association.
 */
export abstract class BaseAssociationSelector<R extends ReferenceValue | ReferenceSetValue> {
    readonly options: DatasourceOptionsProvider;
    readonly caption: DatasourceCaptionsProvider;

    constructor(
        host: SetupComponentHost,
        protected readonly gate: DerivedPropsGate<AssociationGateProps>,
        protected readonly config: ComboboxConfig
    ) {
        const datasource = new MappedGate(gate, (props): DatasourceSource => ({
            ds: required(props.optionsSourceAssociationDataSource, "optionsSourceAssociationDataSource"),
            captionAttributeId:
                config.captionType === "attribute" ? props.optionsSourceAssociationCaptionAttribute?.id : undefined,
            selected: selectedItems(props.attributeAssociation),
            readOnly: props.attributeAssociation.readOnly
        }));
        const captions = new MappedGate(gate, (props): CaptionSource => ({
            formatter:
                config.captionType === "attribute"
                    ? required(
                          props.optionsSourceAssociationCaptionAttribute,
                          "optionsSourceAssociationCaptionAttribute"
                      )
                    : required(
                          props.optionsSourceAssociationCaptionExpression,
                          "optionsSourceAssociationCaptionExpression"
                      ),
            customContent: props.optionsSourceAssociationCustomContent,
            emptyOptionText: props.emptyOptionText
        }));
        this.options = new DatasourceOptionsProvider(host, datasource, { get: id => this.caption.get(id) }, config);
        this.caption = new DatasourceCaptionsProvider(captions, this.options, config.customContentType);
        makeObservable<this, "available">(this, {
            available: computed,
            status: computed,
            readOnly: computed,
            validation: computed,
            clearable: computed
        });
    }

    /** A plain getter on purpose: a Mendix value behind a computed would hide an in-place change. */
    protected get attr(): R {
        return this.gate.props.attributeAssociation as R;
    }

    /** The association, its datasource and the empty-option text are all there. */
    protected get available(): boolean {
        const { attributeAssociation, optionsSourceAssociationDataSource: ds, emptyOptionText } = this.gate.props;
        return (
            attributeAssociation.status !== "unavailable" &&
            ds !== undefined &&
            ds.status !== "unavailable" &&
            emptyOptionText !== undefined &&
            emptyOptionText.status !== "unavailable"
        );
    }

    get status(): Status {
        return this.available ? this.attr.status : "unavailable";
    }

    get readOnly(): boolean {
        return this.attr.readOnly;
    }

    get validation(): string | undefined {
        return this.attr.validation;
    }

    get clearable(): boolean {
        return this.available && this.config.clearable;
    }
}
