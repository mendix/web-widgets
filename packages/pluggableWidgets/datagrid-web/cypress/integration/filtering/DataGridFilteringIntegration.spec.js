describe("datagrid-web filtering integration", () => {
    it("capabilities: combine filter conditions", () => {
        const browserName = Cypress.browser.name;
        const select = name => cy.contains('[role="columnheader"]', name).find("input");
        const option = label => cy.contains("[role=menuitem]", label);
        const rows = () => cy.get(".mx-name-dataGrid21 [role=row]");

        cy.visit("/p/filtering-integration");
        // Await till DG is fully visible
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000);
        rows().should("have.length", 50 + 1);

        select("First name").type("a");
        rows().should("have.length", 29 + 1);

        select("Birth date").type("1/1/1990");
        // remove calendar popup
        select("First name").click();
        rows().should("have.length", 13 + 1);

        select("Birth year").type("1995");
        rows().should("have.length", 8 + 1);

        select("Color (enum)").click();
        option("Black").click();
        rows().should("have.length", 3 + 1);

        select("Roles (ref set)").click();
        option("Careers adviser").click();
        rows().should("have.length", 2 + 1);

        select("Company").click();
        option("Sierra Health Services Inc").click();
        rows().should("have.length", 1 + 1);

        rows()
            .eq(1)
            .should(
                "have.text",
                "Lina3/3/20042004BlackEnvironmental scientistCareers adviserPrison officerMarket research analystSierra Health Services Inc"
            );

        cy.get(".mx-name-dataGrid21").compareSnapshot(`datagrid-${browserName}`, 0.15);
    });
});
