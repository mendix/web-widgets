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
});
