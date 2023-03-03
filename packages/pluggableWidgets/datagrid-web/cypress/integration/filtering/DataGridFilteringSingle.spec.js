describe("datagrid-web filtering single select", () => {
    const browserName = Cypress.browser.name;
    const rows = () => cy.get(".mx-name-dataGrid21 [role=row]");
    const column = n => rows().find(`[role=cell]:nth-child(${n})`);
    const option = label => cy.contains("[role=menuitem]", label);
    const enumSelect = () => cy.get(".mx-name-drop_downFilter1 input");
    const booleanSelect = () => cy.get(".mx-name-drop_downFilter2 input");
    const roleSelect = () => cy.get(".mx-name-drop_downFilter3 input");
    const companySelect = () => cy.get(".mx-name-drop_downFilter4 input");

    beforeEach(() => {
        cy.visit("/p/filtering-single"); // resets page
    });

    it("load snapshot", () => {
        // Wait data snapshot setup
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(10000);
        cy.get(".mx-name-dataGrid21").should("be.visible");
        cy.get(".mx-name-dataGrid21").compareSnapshot(`datagrid-${browserName}`, 0.15);
    });

    describe("capabilities: filter on boolean attribute", () => {
        const optionYes = () => cy.contains("[role=menuitem]", "Yes");
        const optionNo = () => cy.contains("[role=menuitem]", "No");
        const optionEmpty = () => cy.get(".dropdown-list li").first();

        it("filter rows that have Yes in Pets column", () => {
            booleanSelect().click();
            optionYes().click();
            rows().should("have.length", 10 + 1);
            column(3).each(cell => {
                expect(cell).to.have.text("Yes");
            });
        });

        it("filter rows that have No in Pets column", () => {
            booleanSelect().click();
            optionNo().click();
            rows().should("have.length", 10 + 1);
            column(3).each(cell => {
                expect(cell).to.have.text("No");
            });
        });

        it("reset filter state when empty option is clicked", () => {
            booleanSelect().click();
            optionYes().click();
            rows().should("have.length", 10 + 1);
            column(3).should("have.text", "YesYesYesYesYesYesYesYesYesYes");
            booleanSelect().click();
            optionEmpty().click();
            column(3).should("have.text", "YesYesYesNoYesNoNoYesNoYes");
        });
    });

    describe("capabilities: filter on enum attribute", () => {
        it("filter rows that have Cyan in Color column", () => {
            enumSelect().click();
            option("Cyan").click();
            rows().should("have.length", 5 + 1);
            column(2).each(cell => expect(cell).to.have.text("Cyan"));
        });

        it("filter rows that have Black in Color column", () => {
            enumSelect().click();
            option("Black").click();
            rows().should("have.length", 8 + 1);
            column(2).each(cell => expect(cell).to.have.text("Black"));
        });
    });

    describe("capabilities: filter on ReferenceSet attribute", () => {
        it("filter rows that match selected role", () => {
            rows().should("have.length", 10 + 1);
            roleSelect().click();
            option("Trader").click();
            // eslint-disable-next-line cypress/no-unnecessary-waiting
            cy.wait(1000);
            rows().should("have.length", 7 + 1);
            column(4).each(cell => {
                expect(cell).to.include.text("Trader");
            });
        });
    });

    describe("capabilities: filter on Reference attribute", () => {
        it("filter rows that match selected company", () => {
            rows().should("have.length", 10 + 1);
            companySelect().click();
            option("PETsMART Inc").click();
            rows().should("have.length", 8 + 1);
            column(5).each(cell => {
                expect(cell).to.have.text("PETsMART Inc");
            });
        });
    });
});
