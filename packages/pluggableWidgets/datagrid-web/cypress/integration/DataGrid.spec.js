import * as path from "path";

describe("datagrid-web", () => {
    const browserName = Cypress.browser.name;

    describe("capabilities: export to Excel", () => {
        it("check if export to Excel generates correct output", () => {
            const downloadsFolder = Cypress.config("downloadsFolder");
            const downloadedFilename = path.join(downloadsFolder, "testFilename.xlsx");

            cy.visit("/p/export-excel");
            cy.get(".mx-name-dataGridExportExcel").should("be.visible");
            cy.get(".mx-name-exportButton").click({ force: true });
            cy.log("**Confirm downloaded file**");
            cy.readFile(downloadedFilename, "binary", { timeout: 15000 }).should(buffer => {
                expect(buffer.length).to.be.gt(100);
            });

            cy.log("**The file exists**");
            cy.task("readExcelFile", downloadedFilename)
                // returns an array of lines read from Excel file
                .should("have.length", 51)
                .then(list => {
                    expect(list[0], "header line").to.deep.equal([
                        "First name",
                        "Birth date",
                        "Birth year",
                        "Color (enum)",
                        "Roles (ref set)"
                    ]);

                    expect(list[1], "first person").to.deep.equal([
                        "Loretta",
                        "2/15/1983",
                        "1983",
                        "Black",
                        "n/a (custom content)"
                    ]);
                });
        });
    });

    describe("capabilities: sorting", () => {
        it("applies the default sort order from the data source option", () => {
            cy.visit("/");
            cy.get(".mx-name-datagrid1 .column-header").eq(1).should("have.text", "First Name");
            cy.get(".mx-name-datagrid1 .column-header")
                .eq(1)
                .find("svg")
                .should("have.attr", "data-icon", "arrows-alt-v");
            cy.get(".mx-name-datagrid1 .td").should("have.text", "12test3test311test2test210testtest");
        });

        it("changes order of data to ASC when clicking sort option", () => {
            cy.visit("/");
            cy.get(".mx-name-datagrid1 .column-header").eq(1).should("have.text", "First Name");
            cy.get(".mx-name-datagrid1 .column-header")
                .eq(1)
                .find("svg")
                .should("have.attr", "data-icon", "arrows-alt-v");
            cy.get(".mx-name-datagrid1 .column-header").eq(1).click();
            cy.get(".mx-name-datagrid1 .column-header")
                .eq(1)
                .find("svg")
                .should("have.attr", "data-icon", "long-arrow-alt-up");
            cy.get(".mx-name-datagrid1 .td").should("have.text", "10testtest11test2test212test3test3");
        });

        it("changes order of data to DESC when clicking sort option", () => {
            cy.visit("/");
            cy.get(".mx-name-datagrid1 .column-header").eq(1).should("have.text", "First Name");
            cy.get(".mx-name-datagrid1 .column-header").eq(1).click();
            cy.get(".mx-name-datagrid1 .column-header").eq(1).click();
            cy.get(".mx-name-datagrid1 .column-header")
                .eq(1)
                .find("svg")
                .should("have.attr", "data-icon", "long-arrow-alt-down");
            cy.get(".mx-name-datagrid1 .td").should("have.text", "12test3test311test2test210testtest");
        });
    });

    // TODO: Fix this test as cypress is not moving the element correctly
    // describe("capabilities: resizing", () => {
    //     it("changes the size of the column", () => {
    //         cy.get(".mx-name-datagrid1 .column-header")
    //             .first()
    //             .then(el => {
    //                 const [column] = el;
    //                 const size = column.getBoundingClientRect();
    //
    //                 cy.get(".mx-name-datagrid1 .th[role=columnheader]")
    //                     .first()
    //                     .find(".column-resizer")
    //                     .trigger("mousedown", { force: true })
    //                     .trigger("mousemove", 30, 0, { force: true })
    //                     .trigger("mouseup", { force: true });
    //
    //                 cy.get(".mx-name-datagrid1 .column-header")
    //                     .invoke("outerWidth")
    //                     .should("eq", size.width + 30);
    //             });
    //     });
    // });

    describe("capabilities: hiding", () => {
        it("hides a selected column", () => {
            cy.visit("/");
            cy.get(".mx-name-datagrid1 .column-header").first().contains("Age");
            cy.get(".mx-name-datagrid1 .column-selector-button").click();
            cy.get(".column-selectors > li").first().click();
            cy.get(".mx-name-datagrid1 .column-header").first().contains("First Name");
        });

        it("hide column saved on configuration attribute capability", () => {
            cy.visit("/");
            cy.get(".mx-name-datagrid5 .column-selector-button").click();
            cy.get(".column-selectors > li").first().click();
            cy.get(".mx-name-datagrid5 .column-header").first().contains("Last Name");
            cy.get(".mx-name-textArea1 textarea").should(
                "have.text",
                '[{"column":"First Name","sort":false,"sortMethod":"asc","hidden":true,"order":0},{"column":"Last Name","sort":false,"sortMethod":"asc","hidden":false,"order":1}]'
            );
        });

        it("hide column by default enabled", () => {
            cy.visit("/");
            cy.get(".mx-name-datagrid6 .column-header").first().contains("First Name");
            cy.get(".mx-name-datagrid6 .column-selector-button").click();
            cy.get(".column-selectors > li").first().click();
            cy.get(".mx-name-datagrid6 .column-header").first().contains("Id");
        });

        it("do not allow to hide last visible column", () => {
            cy.visit("/");
            cy.get(".mx-name-datagrid1 .column-header").first().should("be.visible");
            cy.get(".mx-name-datagrid1 .column-selector-button").click();
            cy.get(".column-selectors input:checked").should("have.length", 3);
            cy.get(".column-selectors > li").eq(2).click();
            cy.get(".column-selectors > li").eq(1).click();
            cy.get(".column-selectors input:checked").should("have.length", 1);
            cy.get(".column-selectors > li").eq(0).click();
            cy.get(".column-selectors input:checked").should("have.length", 1);
            // Trigger Enter keypress
            cy.get(".column-selectors > li").eq(0).trigger("keydown", { keyCode: 13 });
            cy.get(".column-selectors input:checked").should("have.length", 1);
            // Trigger Space keypress
            cy.get(".column-selectors > li").eq(0).trigger("keydown", { keyCode: 32 });
            cy.get(".column-selectors input:checked").should("have.length", 1);
        });
    });

    describe("capabilities: onClick action", () => {
        it("check the context", () => {
            cy.visit("/");
            cy.get(".mx-name-datagrid1 .td").first().should("have.text", "12");
            cy.get(".mx-name-datagrid1 .td").first().click();
            cy.get(".mx-name-AgeTextBox input").should("have.value", "12");
        });
    });

    describe("manual column width", () => {
        it("compares with a screenshot baseline and checks the column width is with correct size", () => {
            cy.visit("/");
            cy.get(".mx-name-datagrid7").scrollIntoView();
            cy.get(".mx-name-datagrid7").compareSnapshot(`dataGridColumnContent-${browserName}`, 0.2);
        });
    });

    describe("visual testing:", () => {
        it("compares with a screenshot baseline and checks if all datagrid and filter elements are rendered as expected", () => {
            cy.visit("/");
            cy.wait(1000); // eslint-disable-line cypress/no-unnecessary-waiting
            cy.get(".mx-name-datagrid1").should("be.visible");
            cy.get(".mx-name-datagrid1").compareSnapshot(`datagrid-${browserName}`, 0.1);
        });
    });

    describe("a11y testing:", () => {
        it("checks accessibility violations", () => {
            cy.visit("/");
            cy.injectAxe();
            cy.wait(2000); // eslint-disable-line cypress/no-unnecessary-waiting
            cy.configureAxe({
                //TODO: Skipped some rules as we still need to review them
                rules: [
                    { id: "aria-required-children", reviewOnFail: true },
                    { id: "label", reviewOnFail: true }
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
