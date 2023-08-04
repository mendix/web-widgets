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
describe("datagrid-number-filter-web", () => {
    const browserName = Cypress.browser.name;

    beforeEach(() => {
        cy.visit("/"); // resets page
    });

    describe("visual testing:", () => {
        it("compares with a screenshot baseline and checks if all datagrid and filter elements are rendered as expected", () => {
            cy.wait(3000); // eslint-disable-line cypress/no-unnecessary-waiting
            cy.get(".mx-name-datagrid1").should("be.visible");
            cy.get(".mx-name-datagrid1").compareSnapshot(`dataGridNumberFilter-${browserName}`, 0.1);
        });
    });

    describe("number filtering", () => {
        it("shows correct result", () => {
            cy.get(".mx-name-datagrid1").find(".filter-input").type("12", { force: true });

            cy.wait(1000); // eslint-disable-line cypress/no-unnecessary-waiting
            cy.get(".mx-name-datagrid1 .td").should("have.text", "12test3test3");
        });
    });

    describe("with Default value", () => {
        it("set init condition (apply filer right after load", () => {
            // NBSP is coming from "FilterSelector" (facepalm)
            const NBSP = " ";
            const expected = [`First nameYear${NBSP}`, "Delia1987", "Lizzie1987"];

            cy.visit("/#/filter_init_condition");
            cy.reload(true);
            cy.get(".mx-name-dataGrid21 [role=row]").each((row, index) => {
                cy.wrap(row).should("have.text", expected[index]);
            });
            cy.get(".mx-name-dataGrid21 .paging-status").should("have.text", "1 to 2 of 2");
        });
    });
    describe("a11y testing:", () => {
        it("checks accessibility violations", () => {
            cy.visit("/");
            cy.injectAxe();
            cy.wait(3000); // eslint-disable-line cypress/no-unnecessary-waiting
            // Test the widget at initial load
            cy.checkA11y(
                ".mx-name-datagrid1",
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
