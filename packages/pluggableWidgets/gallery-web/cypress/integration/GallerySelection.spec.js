function terminalLog(violations) {
    cy.task(
        "log",
        `${violations.length} accessibility violation${violations.length === 1 ? "" : "s"} ${
            violations.length === 1 ? "was" : "were"
        } detected`
    );
    // pluck specific keys to keep the table readable
    const violationData = violations.map(({ id, impact, description, nodes }) => ({
        id,
        impact,
        description,
        nodes: nodes.length
    }));

    cy.task("table", violationData);
}
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
            // Test the widget at initial load
            cy.checkA11y(
                ".mx-name-gallery1",
                {
                    runOnly: {
                        type: "tag",
                        values: ["wcag2a"]
                    }
                },
                terminalLog
            );
        });
    });
});
