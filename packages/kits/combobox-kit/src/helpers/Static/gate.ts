import { ComboboxGateProps } from "../../core/ComboboxGate";

export type StaticGateProps = Pick<
    ComboboxGateProps,
    "staticAttribute" | "optionsSourceStaticDataSource" | "emptyOptionText"
>;
