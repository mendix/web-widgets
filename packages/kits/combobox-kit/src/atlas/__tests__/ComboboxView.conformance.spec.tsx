import { describeComboboxConformance } from "../../conformance/describeComboboxConformance";
import { ComboboxView } from "../ComboboxView";

jest.mock("../../hooks/useFloatingMenu");

describeComboboxConformance("ComboboxView (Atlas)", ComboboxView);
