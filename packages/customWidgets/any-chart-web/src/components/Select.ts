import { Component, ReactElement, SyntheticEvent, createElement } from "react";

export interface SelectProps {
    onChange: (value: string) => void;
    options: SelectOption[];
}

export interface SelectOption {
    name: string;
    value: string;
    isDefaultSelected: boolean;
}

export class Select extends Component<SelectProps, {}> {
    render() {
        return createElement(
            "select",
            { className: "form-control", onChange: this.onChange },
            this.renderSelectOptions()
        );
    }

    private renderSelectOptions(): ReactElement<Partial<HTMLOptionElement>>[] {
        return this.props.options.map((option, index) =>
            createElement(
                "option",
                {
                    defaultSelected: option.isDefaultSelected,
                    value: option.value,
                    key: `select-option-${index}`
                },
                option.name
            )
        );
    }

    private onChange = ({ currentTarget }: SyntheticEvent<HTMLSelectElement>) => {
        this.props.onChange(currentTarget.value);
    };
}
