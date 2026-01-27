import { KeyNavProvider } from "@mendix/widget-plugin-grid/keyboard-navigation/context";
import { observer } from "mobx-react-lite";
import { useGalleryConfig, useItems, useKeyNavFocus, useTextsService } from "../model/hooks/injection-hooks";
import { ListBox } from "./ListBox";
import { ListItem } from "./ListItem";

export const GalleryItems = observer(function GalleryItems() {
    const items = useItems().get();
    const config = useGalleryConfig();
    const texts = useTextsService();
    const focusController = useKeyNavFocus();
    const selectionHelper = null; // Placeholder for selection helper

    if (items.length === 0) {
        return <div>Empty</div>;
    }

    return (
        <ListBox
            lg={config.desktopItems}
            md={config.tabletItems}
            sm={config.phoneItems}
            selectionType={config.selectionType}
            aria-label={texts.listboxAriaLabel}
        >
            <KeyNavProvider focusController={focusController}>
                {items.map((item, index) => (
                    <ListItem
                        preview={false}
                        key={item.id}
                        helper={null}
                        item={item}
                        selectionHelper={selectionHelper}
                        eventsController={null}
                        getPosition={() => index}
                        itemIndex={index}
                        label={null}
                    />
                ))}
            </KeyNavProvider>
        </ListBox>
    );
});
