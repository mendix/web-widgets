Please see [Data Grid 2](https://docs.mendix.com/appstore/modules/data-grid-2) in the Mendix documentation for details.

### Top horizontal scrollbar

Enable **Appearance > Show top horizontal scrollbar** to display an additional horizontal scrollbar above the grid when its columns overflow. It follows the horizontal position of the existing content viewport and updates when columns are hidden, shown, or resized.

The option is disabled by default. It does not change column personalization or vertical scrolling. The additional scrollbar is a pointer convenience; keyboard and assistive technology users continue to use the existing grid navigation.

#### Enabled-option regression fixture

The default-off test runs against the unmodified official test project. The additional `TopHorizontalScrollbarEnabled.spec.js` suite is opt-in because it requires an enabled-option fixture and creates 500 synthetic `MyFirstModule.Person` records. Use a disposable local copy of the `datagrid-web/data-widgets-3.0` branch of `mendix/testProjects`, with its three initial Person records.

1. Build this widget and update it in the test project. Use the current Data Widgets themesource.
2. In Studio Pro, enable **Show top horizontal scrollbar** on `MyFirstModule.Home_Web.datagrid1` and `MyFirstModule.Page.dataGrid21`. Keep the virtual grid's page size of 2.
3. Run the project locally. Set `URL` to its localhost address and `TOP_SCROLLBAR_ENABLED_FIXTURE=1`, then run `pnpm exec playwright test e2e/TopHorizontalScrollbarEnabled.spec.js --project=chromium --workers=1` from this package.

The suite tests native browser input for column resizing, hide/show, bidirectional horizontal synchronization, loading all 503 rows through virtual scrolling, preservation of vertical position, and negative RTL offsets. It applies `dir="rtl"` to the Mendix page root to exercise Atlas RTL layout; it does not test application translations. Seeding is restricted to localhost. Run the default-off test separately against a fresh project with the option disabled.
