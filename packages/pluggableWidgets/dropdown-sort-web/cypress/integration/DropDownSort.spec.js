describe("dropdown-sort-web", () => {
    beforeEach(() => {
        cy.visit("/");
    });
    it("shows the descending order", () => {
        cy.get(".mx-name-drop_downSort1").click();
        cy.get(".dropdown-list > li:nth-child(2)").click();
        cy.get(".mx-name-drop_downSort1").find(".btn").first().click();
        cy.wait(1000); // eslint-disable-line cypress/no-unnecessary-waiting
        cy.get(".mx-name-gallery1").find(".widget-gallery-item").first().should("have.text", "test3");
    });

    it("shows the ascending order", () => {
        cy.get(".mx-name-drop_downSort1").click();
        cy.get(".dropdown-list > li:nth-child(2)").click();
        cy.get(".mx-name-drop_downSort1").find(".btn").first().click();
        cy.get(".mx-name-drop_downSort1").find(".btn").first().click();
        cy.wait(1000); // eslint-disable-line cypress/no-unnecessary-waiting
        cy.get(".mx-name-gallery1").find(".widget-gallery-item").first().should("have.text", "test");
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
                { id: "duplicate-id", reviewOnFail: true },
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
