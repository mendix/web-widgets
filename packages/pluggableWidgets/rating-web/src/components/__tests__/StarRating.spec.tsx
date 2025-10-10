import { actionValue, EditableValueBuilder } from "@mendix/widget-plugin-test-utils";
import { StarRatingContainerProps } from "../../../typings/StarRatingProps";
import { Big } from "big.js";
import { fireEvent, render, screen } from "@testing-library/react";
import { StarRating } from "../../StarRating";
import "@testing-library/jest-dom";

const defaultProps: StarRatingContainerProps = {
    class: "",
    name: "rating",
    tabIndex: 0,
    rateAttribute: new EditableValueBuilder<Big>().withValue(new Big(5)).build(),
    animation: true,
    maximumStars: 5
};

function renderStarRating(props?: Partial<StarRatingContainerProps>): ReturnType<typeof render> {
    return render(<StarRating {...defaultProps} {...props} />);
}

describe("StarRating rendering", () => {
    it("renders correctly the structure", () => {
        const { asFragment } = renderStarRating();
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders correctly the structure without animation", () => {
        const { asFragment } = renderStarRating({ animation: false });
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders correctly the structure when disabled", () => {
        const { asFragment } = renderStarRating({
            rateAttribute: new EditableValueBuilder<Big>().withValue(new Big(1)).isReadOnly().build()
        });
        expect(asFragment()).toMatchSnapshot();
    });
});

describe("StarRating events", () => {
    it("triggers correctly on change action", () => {
        const onChange = actionValue();
        renderStarRating({ onChange });
        const radios = screen.getAllByRole("radio");
        fireEvent.click(radios[0]);
        expect(onChange.execute).toHaveBeenCalled();
    });

    it("defines correct values to attribute on change action", () => {
        const ratingAttribute = new EditableValueBuilder<Big>().withValue(new Big(0)).build();
        renderStarRating({ rateAttribute: ratingAttribute });
        const radios = screen.getAllByRole("radio");
        fireEvent.click(radios[0]);
        expect(ratingAttribute.setValue).toHaveBeenCalledWith(new Big(1));
    });

    it("doesnt call setValue when value is read only", () => {
        const ratingAttribute = new EditableValueBuilder<Big>().withValue(new Big(1)).isReadOnly().build();
        renderStarRating({ rateAttribute: ratingAttribute });
        const radios = screen.getAllByRole("radio");
        fireEvent.click(radios[0]);
        expect(ratingAttribute.setValue).not.toHaveBeenCalled();
    });

    it("doesnt trigger on change action when attribute is read only", () => {
        const onChange = actionValue();
        renderStarRating({
            rateAttribute: new EditableValueBuilder<Big>().withValue(new Big(1)).isReadOnly().build(),
            onChange
        });
        const radios = screen.getAllByRole("radio");
        fireEvent.click(radios[0]);
        expect(onChange.execute).not.toHaveBeenCalled();
    });
});
