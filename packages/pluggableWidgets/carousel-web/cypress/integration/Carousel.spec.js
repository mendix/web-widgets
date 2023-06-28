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
describe("Carousel", () => {
    before(() => {
        cy.visit("/");
        cy.injectAxe();
        cy.wait(5000); // eslint-disable-line cypress/no-unnecessary-waiting
    });
    it("disables the left arrow when showing the first item", { retries: 3 }, () => {
        cy.get(".swiper-button-prev").should("exist").and("have.class", "swiper-button-disabled");
    });

    it("enables the left arrow when it navigates from the first item", { retries: 3 }, () => {
        cy.get(".swiper-button-next").click({ force: true });
        cy.get(".swiper-button-prev").should("be.visible");
    });

    it("disables the right arrow when on the last image item", { retries: 3 }, () => {
        cy.get(".swiper-button-next").should("have.class", "swiper-button-disabled");
    });

    it("shows enlarged image when image is clicked", { retries: 3 }, () => {
        cy.get(".swiper-button-prev").click({ force: true });
        cy.get(".mx-name-Image01").first().click({ force: true });
        cy.get(".mx-imagezoom-image").should("be.visible");
    });
    it("check accessibility violations", { retries: 1 }, () => {
        // Test the widget at initial load
        cy.checkA11y(
            ".mx-name-carousel2",
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
