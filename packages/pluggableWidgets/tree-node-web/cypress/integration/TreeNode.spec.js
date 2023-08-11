describe("tree-node-web", () => {
    const browserName = Cypress.browser.name;
    const cleanMendixSession = () => {
        cy.window().then(window => {
            // Cypress opens a new session for every test, so it exceeds mendix license limit of 5 sessions, we need to logout after each test.
            window.mx.session.logout();
        });
    };

    beforeEach(() => {
        cy.visit("/");
    });

    afterEach(() => cleanMendixSession());

    function getTreeNodeHeaders() {
        return cy.get(".mx-name-treeNode1 .widget-tree-node-branch-header-value");
    }

    describe("capabilities: expand", () => {
        it("expands a node", () => {
            getTreeNodeHeaders().first().click();
            cy.get(".mx-name-treeNode1").wait(1000).compareSnapshot(`treeNodeExpanded-${browserName}`, 0.1); // eslint-disable-line cypress/no-unnecessary-waiting
        });

        it("expands multiple nodes", () => {
            getTreeNodeHeaders().eq(1).click();
            getTreeNodeHeaders().first().click();
            cy.get(".mx-name-treeNode1").wait(1000).compareSnapshot(`treeNodeMultipleExpanded-${browserName}`, 0.1); // eslint-disable-line cypress/no-unnecessary-waiting
        });
    });

    describe("capabilities: collapse", () => {
        it("collapses a node", () => {
            getTreeNodeHeaders().first().click();
            getTreeNodeHeaders().first().click();
            cy.get(".mx-name-treeNode1").wait(1000).compareSnapshot(`treeNodeCollapsed-${browserName}`, 0.1); // eslint-disable-line cypress/no-unnecessary-waiting
        });

        it("collapses multiple nodes", () => {
            getTreeNodeHeaders().eq(1).click();
            getTreeNodeHeaders().first().click();
            cy.wait(500); // eslint-disable-line cypress/no-unnecessary-waiting
            getTreeNodeHeaders().eq(11).click();
            getTreeNodeHeaders().eq(11).click();
            getTreeNodeHeaders().first().click();
            cy.wait(500); // eslint-disable-line cypress/no-unnecessary-waiting
            // Second header has become the 5th cuz first header was opened and introduces 3 headers.
            getTreeNodeHeaders().eq(4).click();
            cy.get(".mx-name-treeNode1").wait(1000).compareSnapshot(`treeNodeMultipleCollapsed-${browserName}`, 0.1); // eslint-disable-line cypress/no-unnecessary-waiting
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
                    { id: "duplicate-id-active", reviewOnFail: true }
                ]
            });
            // Test the widget at initial load
            cy.checkA11y(
                ".mx-name-treeNode1",
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
