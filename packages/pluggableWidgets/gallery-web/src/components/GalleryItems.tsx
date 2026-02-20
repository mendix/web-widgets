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

    if (items.length < 1) {
        return null;
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
                    <ListItem key={item.id} item={item} itemIndex={index} />
                ))}
            </KeyNavProvider>
        </ListBox>
    );
});
