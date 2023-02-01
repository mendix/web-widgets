describe("datagrid-dropdown-filter-web", () => {
    const browserName = Cypress.browser.name;

    beforeEach(() => {
        cy.visit("/p/associations-filter");
    });

    describe("visual testing:", () => {
        xit("compares with a screenshot baseline and checks if all datagrid and filter elements are rendered as expected", () => {
            cy.wait(3000);
            cy.get(".mx-name-dataGrid21").should("be.visible");
            cy.get(".mx-name-dataGrid21").compareSnapshot(`dataGridDropDownFilter-${browserName}`, 0.1);
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
