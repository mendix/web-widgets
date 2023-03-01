describe("datagrid-dropdown-filter-web", () => {
    const browserName = Cypress.browser.name;

    beforeEach(() => {
        cy.visit("/p/associations-filter");
    });

    describe("visual testing:", () => {
        it("compares with a screenshot baseline and checks if all datagrid and filter elements are rendered as expected", () => {
            // Waiting for data snapshot setup
            // eslint-disable-next-line cypress/no-unnecessary-waiting
            cy.wait(10000);
            cy.get(".mx-name-dataGrid21").should("be.visible");
            cy.get(".mx-name-dataGrid21").compareSnapshot(`dataGridDropDownFilter-${browserName}`, 0.15);
        });
    });

    describe("single select", () => {
        const rows = () => cy.get(".mx-name-dataGrid21 .tr");
        const select = () => cy.get(".mx-name-drop_downFilter2 input");
        const menu = () => cy.contains('[role="menu"]', "FMC Corp");
        const options = () => menu().find('[role="menuitem"]');
        const option1 = () => cy.contains('[role="menuitem"]', "Brown-Forman Corporation");
        const clickOutside = () => cy.get("body").click();

        describe("when used with Companies", () => {
            it("show list of Companies with empty option on top of the list", () => {
                cy.get(".mx-name-drop_downFilter2").should("be.visible");
                select().click();
                menu().should("be.visible");
                options().should("have.length", 20 + 1);
                // Empty option item
                options().first().should("have.text", "");
                // First option
                options().first().next().should("have.text", "Merck & Co., Inc.");
                // Last option
                options().last().should("have.text", "PETsMART Inc");
            });

            it("set value after option is clicked", () => {
                select().click();
                menu().should("be.visible");
                option1().click();
                select().should("have.value", "Brown-Forman Corporation");
                clickOutside();
                menu().should("not.exist");
                select().should("have.value", "Brown-Forman Corporation");
                rows().should("have.length", 1 + 1);
            });
        });
    });

    describe("multiselect", () => {
        describe("when used with Roles", () => {
            it("shows list of Roles", () => {
                cy.get(".mx-name-drop_downFilter1").should("be.visible");
                cy.get(".mx-name-drop_downFilter1 input").click();
                cy.contains('[role="menuitem"]', "Economist");
                cy.contains('[role="menuitem"]', "Public librarian");
                cy.contains('[role="menuitem"]', "Prison officer");
            });

            it("does filtering when option is checked", () => {
                cy.get(".mx-name-drop_downFilter1 input").click();
                cy.contains('[role="menuitem"]', "Public librarian").click();
                cy.get(".mx-name-dataGrid21 .tr").should("have.length", 4 + 1);
            });
        });

        describe("keep state of checked options", () => {
            const rows = () => cy.get(".mx-name-dataGrid21 .tr");
            const select = () => cy.get(".mx-name-drop_downFilter1 input");
            const menu = () => cy.contains('[role="menu"]', "Environmental scientist");
            const option1 = () => cy.contains('[role="menuitem"]', "Environmental scientist");
            const option2 = () => cy.contains('[role="menuitem"]', "Trader");
            const clickOutside = () => cy.get("body").click();

            it("open menu with no options selected", () => {
                select().click();
                menu().find("input:checked").should("have.length", 0);
                clickOutside();
                menu().should("not.exist");
            });

            it("keep option checked after menu closed", () => {
                select().click();
                menu().find("input:checked").should("have.length", 0);
                option1().click();
                option1().find("input").should("be.checked");
                menu().find("input:checked").should("have.length", 1);
                clickOutside();
                menu().should("not.exist");
                rows().should("have.length", 8 + 1);
                select().click();
                menu().find("input:checked").should("have.length", 1);
                option1().find("input").should("be.checked");
            });

            it("keep multiple options checked after menu closed", () => {
                select().click();
                menu().find("input:checked").should("have.length", 0);
                option1().click();
                option1().find("input").should("be.checked");
                menu().find("input:checked").should("have.length", 1);
                clickOutside();
                menu().should("not.exist");
                rows().should("have.length", 8 + 1);
                select().click();
                menu().find("input:checked").should("have.length", 1);
                option1().find("input").should("be.checked");
                option2().click();
                option2().find("input").should("be.checked");
                menu().find("input:checked").should("have.length", 2);
                clickOutside();
                menu().should("not.exist");
                rows().should("have.length", 10 + 1);
                select().click();
                menu().find("input:checked").should("have.length", 2);
                option1().find("input").should("be.checked");
                option2().find("input").should("be.checked");
            });
        });
    });
});
