describe("datagrid-date-filter-web", () => {
    const browserName = Cypress.browser.name;

    beforeEach(() => {
        cy.visit("/");
    });

    describe("visual testing:", () => {
        it("compares with a screenshot baseline and checks if all datagrid and filter elements are rendered as expected", () => {
            cy.wait(3000); // eslint-disable-line cypress/no-unnecessary-waiting
            cy.get(".mx-name-datagrid1").should("be.visible");
            cy.get(".mx-name-datagrid1").compareSnapshot(`dataGridDateFilter-${browserName}`, 0.1);
        });
    });

    it("compares with a screenshot baseline and checks if date picker element is rendered as expected", () => {
        cy.get(".mx-name-datagrid1").find(".btn-calendar").first().click();
        cy.wait(1000); // eslint-disable-line cypress/no-unnecessary-waiting
        cy.get(".mx-name-datagrid1").compareSnapshot(`dataGridDateFilterDatePicker-${browserName}`, 1);
    });

    it("filters a typed date", () => {
        cy.get(".mx-name-datagrid1").find(".filter-input").type("10/5/2020", { force: true });
        cy.get(".mx-name-datagrid1 .td").should("contain.text", "10/5/2020");
    });

    it("filters between dates", () => {
        cy.get(".filter-selector").click();
        cy.get(".filter-selectors").find("li").first().click();
        cy.get(".mx-name-datagrid1").find(".btn-calendar").click();
        cy.get(".react-datepicker__month-select").select("October");
        cy.get(".react-datepicker__year-select").select("2020");
        cy.get(".react-datepicker__day--004").click();
        cy.get(".react-datepicker__day--005").click();
        cy.get(".mx-name-layoutGrid1").first().click();
        cy.get(".mx-name-datagrid1 .td").should("contain.text", "10/5/2020");
    });

    describe("with Default value", () => {
        it("set initial condition (apply filter right after load)", () => {
            cy.visit("/#/filter_init_condition", { timeout: 1000 });
            cy.reload(true);
            cy.get(".mx-name-dataGrid22 [role=row]").eq(1).should("have.text", "Chester2/20/2003");
            cy.get(".mx-name-dataGrid22 [role=row]").eq(7).should("have.text", "Tyler5/31/2001");
            cy.get(".mx-name-dataGrid22 [role=row]").should("have.length", 1 + 7);
        });
    });

    describe("with Default start and Default end dates", () => {
        it("set initial condition (apply filter right after load)", () => {
            cy.visit("/#/filter_init_condition", { timeout: 1000 });
            cy.reload(true);
            cy.get(".mx-name-dataGrid21 [role=row]").eq(1).should("have.text", "Jayden4/21/1993");
            cy.get(".mx-name-dataGrid21 [role=row]").eq(10).should("have.text", "Inez8/13/1992");
            cy.get(".mx-name-dataGrid21 [role=row]").should("have.length", 1 + 10);
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
