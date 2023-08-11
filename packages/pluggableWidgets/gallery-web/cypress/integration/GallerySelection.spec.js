describe("gallery-web", () => {
    const browserName = Cypress.browser.name;

    describe("capabilities: selection", () => {
        it("applies single select", () => {
            cy.visit("/p/single-selection");
            cy.get(".mx-name-gallery1").should("be.visible");
            cy.get(".mx-name-imageViewer1").first().click();
            cy.get(".sprintrFeedback__sidebar").hideElement();
            cy.get(".mx-name-layoutGrid1").eq(1).compareSnapshot(`gallerySingleSelection-${browserName}`, 0.1);
        });

        it("applies multi select", () => {
            cy.visit("/p/multi-selection");
            cy.get(".mx-name-gallery1").should("be.visible");
            cy.get(".mx-name-imageViewer1").eq(0).click();
            cy.get(".mx-name-imageViewer1").eq(1).click();
            cy.get(".mx-name-imageViewer1").eq(2).click();
            cy.get(".sprintrFeedback__sidebar").hideElement();
            cy.get(".mx-name-layoutGrid1").eq(1).compareSnapshot(`galleryMultiSelection-${browserName}`, 0.1);
        });
    });
    describe("a11y testing:", () => {
        it("checks accessibility violations", () => {
            cy.visit("/p/multi-selection");
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
