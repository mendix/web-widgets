describe("datagrid-dropdown-filter-web", () => {
    const browserName = Cypress.browser.name;

    beforeEach(() => {
        cy.visit("/");
    });

    describe("visual testing:", () => {
        it("compares with a screenshot baseline and checks if all datagrid and filter elements are rendered as expected", () => {
            cy.wait(3000); // eslint-disable-line cypress/no-unnecessary-waiting
            cy.get(".mx-name-datagrid1").should("be.visible");
            cy.get(".mx-name-datagrid1").compareSnapshot(`dataGridDropDownFilter-${browserName}`, 0.1);
        });
    });

    describe("using enumeration as attribute", () => {
        it("shows the expected result", () => {
            cy.get(".mx-name-datagrid1").find(".dropdown-container").first().click();
            cy.get(".dropdown-list > li:nth-child(1)").click();
            cy.wait(1000); // eslint-disable-line cypress/no-unnecessary-waiting
            cy.get(".mx-name-datagrid1 .td").should("have.text", "10testtestYes");
        });

        it("shows the expected result with multiple selected items", () => {
            cy.get(".mx-name-datagrid1").find(".dropdown-container").first().click();
            cy.get(".dropdown-list > li:nth-child(1)").click();
            cy.get(".dropdown-list > li:nth-child(2)").click();
            cy.wait(1000); // eslint-disable-line cypress/no-unnecessary-waiting
            cy.get(".mx-name-datagrid1 .td").should("have.text", "10testtestYes20test2test2Yes");
        });
    });

    describe("using boolean as attribute", () => {
        it("shows the expected result", () => {
            cy.get(".mx-name-datagrid1").find(".dropdown-container").last().click();
            cy.get(".dropdown-list > li:nth-child(3)").should("have.text", "No");
            cy.get(".dropdown-list > li:nth-child(3)").click();
            cy.wait(1000); // eslint-disable-line cypress/no-unnecessary-waiting
            cy.get(".mx-name-datagrid1 .td").should("have.length", 0);
        });
    });

    describe("with Default value", () => {
        it("in single mode, set init condition for boolean", () => {
            const expected = [
                "First namePets (boolean)",
                "LorettaYes",
                "ChadYes",
                "JosieYes",
                "ChesterYes",
                "CoreyYes",
                "BryanYes",
                "DonYes",
                "FloydYes",
                "CeceliaYes",
                "OpheliaYes"
            ];

            cy.visit("/#/filter_init_condition");
            cy.reload(true);
            cy.get(".mx-name-dataGrid21 [role=row]").each((row, index) => {
                cy.wrap(row).should("have.text", expected[index]);
            });
            cy.get(".mx-name-dataGrid21 .paging-status").should("have.text", "1 to 10 of 27");
        });

        it("in single mode, set init condition for enum", () => {
            const expected = [
                "First nameColor (enum)",
                "ChesterCyan",
                "DeliaCyan",
                "LizzieCyan",
                "DeanCyan",
                "MitchellCyan"
            ];

            cy.visit("/#/filter_init_condition");
            cy.reload(true);
            cy.get(".mx-name-dataGrid22 [role=row]").each((row, index) => {
                cy.wrap(row).should("have.text", expected[index]);
            });
            cy.get(".mx-name-dataGrid22 .paging-status").should("have.text", "1 to 5 of 5");
        });

        it("in multi mode, set init condition for boolean", () => {
            const expected = [
                "First namePets (boolean)",
                "LorettaYes",
                "ChadYes",
                "JosieYes",
                "ChesterYes",
                "CoreyYes",
                "BryanYes",
                "DonYes",
                "FloydYes",
                "CeceliaYes",
                "OpheliaYes"
            ];

            cy.visit("/#/filter_init_condition");
            cy.reload(true);
            cy.get(".mx-name-dataGrid23 [role=row]").each((row, index) => {
                cy.wrap(row).should("have.text", expected[index]);
            });
            cy.get(".mx-name-dataGrid23 .paging-status").should("have.text", "1 to 10 of 27");
        });

        it("in multi mode, set init condition for enum", () => {
            const expected = [
                "First nameColor (enum)",
                "ChesterCyan",
                "DeliaCyan",
                "LizzieCyan",
                "DeanCyan",
                "MitchellCyan"
            ];

            cy.visit("/#/filter_init_condition");
            cy.reload(true);
            cy.get(".mx-name-dataGrid24 [role=row]").each((row, index) => {
                cy.wrap(row).should("have.text", expected[index]);
            });
            cy.get(".mx-name-dataGrid24 .paging-status").should("have.text", "1 to 5 of 5");
        });

        it("in multi mode, with multiple default values, set init condition for enum", () => {
            const expected = [
                "First nameColor (enum)",
                "ChadRed",
                "JosieRed",
                "ChesterCyan",
                "DeliaCyan",
                "CoreyBlue",
                "BryanBlue",
                "LuellaBlue",
                "LizzieCyan",
                "DollieRed",
                "HesterRed"
            ];

            cy.visit("/#/filter_init_condition");
            cy.reload(true);
            cy.get(".mx-name-dataGrid25 [role=row]").each((row, index) => {
                cy.wrap(row).should("have.text", expected[index]);
            });
            cy.get(".mx-name-dataGrid25 .paging-status").should("have.text", "1 to 10 of 19");
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
                ".mx-name-datagrid1",
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
