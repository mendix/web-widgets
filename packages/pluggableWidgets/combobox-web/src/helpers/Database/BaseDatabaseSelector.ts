import { Big } from "big.js";
import { ListValue, SelectionMultiValue, SelectionSingleValue } from "mendix";
import { DerivedPropsGate, MappedGate, SetupComponentHost } from "@mendix/widget-plugin-mobx-kit/main";
import { ComboboxConfig } from "../../core/Combobox.config";
import { ComboboxGateProps } from "../../core/ComboboxGate";
import { CaptionSource, DatasourceCaptionsProvider } from "../DatasourceCaptionsProvider";
import { DatasourceOptionsProvider, DatasourceSource } from "../DatasourceOptionsProvider";
import { required } from "../utils";

export type DatabaseGateProps = Pick<
    ComboboxGateProps,
    | "optionsSourceDatabaseDataSource"
    | "optionsSourceDatabaseItemSelection"
    | "optionsSourceDatabaseCaptionAttribute"
    | "optionsSourceDatabaseCaptionExpression"
    | "optionsSourceDatabaseCustomContent"
    | "optionsSourceDatabaseValueAttribute"
    | "databaseAttributeString"
    | "customEditabilityExpression"
    | "emptyOptionText"
>;

/**
 * A selector over a database list: the options are its items, the value is the datasource
 * selection and, in single mode, the bound attribute that holds the selected item's value.
 */
export abstract class BaseDatabaseSelector {
    readonly options: DatasourceOptionsProvider;
    readonly caption: DatasourceCaptionsProvider;

    constructor(
        host: SetupComponentHost,
        protected readonly gate: DerivedPropsGate<DatabaseGateProps>,
        protected readonly config: ComboboxConfig
    ) {
        const datasource = new MappedGate(gate, (props): DatasourceSource => ({
            ds: required(props.optionsSourceDatabaseDataSource, "optionsSourceDatabaseDataSource"),
            captionAttributeId:
                config.captionType === "attribute" ? props.optionsSourceDatabaseCaptionAttribute?.id : undefined,
            readOnly: this.readOnly
        }));
        const captions = new MappedGate(gate, (props): CaptionSource => ({
            formatter: this.formatter,
            customContent: props.optionsSourceDatabaseCustomContent,
            emptyOptionText: props.emptyOptionText,
            valueAttribute: props.optionsSourceDatabaseValueAttribute,
            displayValue: this.displayValue
        }));
        this.options = new DatasourceOptionsProvider(host, datasource, { get: id => this.caption.get(id) }, config);
        this.caption = new DatasourceCaptionsProvider(captions, this.options, config.customContentType);
    }

    abstract get readOnly(): boolean;

    protected get ds(): ListValue {
        return required(this.gate.props.optionsSourceDatabaseDataSource, "optionsSourceDatabaseDataSource");
    }

    protected get selection(): SelectionSingleValue | SelectionMultiValue | undefined {
        return this.gate.props.optionsSourceDatabaseItemSelection;
    }

    protected get formatter(): CaptionSource["formatter"] {
        const props = this.gate.props;
        return this.config.captionType === "attribute"
            ? props.optionsSourceDatabaseCaptionAttribute
            : props.optionsSourceDatabaseCaptionExpression;
    }

    /** Single mode: the bound attribute's display value captions the empty option. */
    protected get displayValue(): string | undefined {
        return undefined;
    }

    protected get emptyOptionAvailable(): boolean {
        const text = this.gate.props.emptyOptionText;
        return text !== undefined && text.status !== "unavailable";
    }

    /** The value attribute's value for an option id. */
    protected optionValue(id: string | null): string | Big | undefined {
        const item = this.options.item(id);
        const attribute = this.gate.props.optionsSourceDatabaseValueAttribute;
        if (!item || !attribute) {
            return undefined;
        }
        const value = attribute.get(item);
        return value.status === "unavailable" ? undefined : value.value;
    }
}
