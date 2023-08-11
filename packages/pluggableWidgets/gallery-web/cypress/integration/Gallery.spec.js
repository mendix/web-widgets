describe("gallery-web", () => {
    const browserName = Cypress.browser.name;

    beforeEach(() => {
        cy.visit("/");
    });

    describe("capabilities: sorting", () => {
        it("applies the default sort order from the data source option", () => {
            cy.wait(3000); // eslint-disable-line cypress/no-unnecessary-waiting
            cy.get(".mx-name-gallery1").should("be.visible");
            cy.get(".mx-name-gallery1").compareSnapshot(`galleryContent-${browserName}`, 0.1);
        });

        it("changes order of data choosing another option in the dropdown sort", () => {
            const gallery = ".mx-name-gallery1";
            const dropdownSort = ".mx-name-drop_downSort2 input";

            cy.get(dropdownSort).first().click();
            cy.contains("[role=menuitem]", "Age").click();
            cy.get(gallery).compareSnapshot(`galleryDropdownSort-${browserName}`, 0.1);
        });
    });

    describe("capabilities: filtering", () => {
        it("filters by text", () => {
            const gallery = ".mx-name-gallery1";
            const textFilter = ".mx-name-gallery1 .form-control";

            cy.get(textFilter).first().type("Leo");
            cy.wait(1000); // eslint-disable-line cypress/no-unnecessary-waiting
            cy.get(gallery).compareSnapshot(`galleryTextFilter-${browserName}`, 0.1);
        });

        it("filters by number", () => {
            const gallery = ".mx-name-gallery1";
            const textFilter = ".mx-name-gallery1 .form-control";

            cy.get(textFilter).eq(1).type("32");
            cy.wait(1000); // eslint-disable-line cypress/no-unnecessary-waiting
            cy.get(gallery).compareSnapshot(`galleryNumberFilter-${browserName}`, 0.1);
        });

        it("filters by date", () => {
            const gallery = ".mx-name-gallery1";
            const textFilter = ".mx-name-gallery1 .form-control";

            cy.get(textFilter).eq(3).type("10/10/1986");
            cy.wait(1000); // eslint-disable-line cypress/no-unnecessary-waiting
            cy.get(gallery).compareSnapshot(`galleryDateFilter-${browserName}`, 0.1);
        });

        it("filters by enum (dropdown)", () => {
            const gallery = ".mx-name-gallery1";
            const dropdown = ".mx-name-gallery1 .mx-name-drop_downFilter1 input";

            cy.get(dropdown).first().click();
            cy.get(".dropdown-content li").eq(4).click();
            cy.get(gallery).compareSnapshot(`galleryDropdownFilter-${browserName}`, 0.1);
        });
    });

    describe("capabilities: onClick action", () => {
        it("check the context", () => {
            const textFilter = ".mx-name-gallery1 .form-control";

            cy.get(textFilter).first().type("Leo");
            cy.wait(1000); // eslint-disable-line cypress/no-unnecessary-waiting

            const galleryItem = ".mx-name-gallery1 .widget-gallery-item";

            cy.get(galleryItem).first().click();

            const context = "You've clicked at Leo's face.";
            const popUpElement = ".mx-dialog-body > p";

            cy.get(popUpElement).should("have.text", context);
        });
    });
    describe("a11y testing:", () => {
        it("checks accessibility violations", () => {
            cy.visit("/");
            cy.injectAxe();
            cy.wait(3000); // eslint-disable-line cypress/no-unnecessary-waiting
            cy.configureAxe({
                //TODO: Skipped some rules as we still need to review them
                rules: [
                    { id: "aria-required-children", reviewOnFail: true },
                    { id: "label", reviewOnFail: true },
                    { id: "aria-roles", reviewOnFail: true },
                    { id: "button-name", reviewOnFail: true },
                    { id: "duplicate-id-active", reviewOnFail: true },
                    { id: "aria-allowed-attr", reviewOnFail: true }
                ]
            });
            // Test the widget at initial load
            cy.checkA11y(
                ".mx-name-gallery1",
                {
                    runOnly: {
                        type: "tag",
                        values: ["wcag2a"]
                    }
                },
                cy.terminalLog
            );
        });
    });
});
