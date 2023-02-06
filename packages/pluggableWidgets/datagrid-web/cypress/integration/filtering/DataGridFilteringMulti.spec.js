describe("datagrid-web filtering multi select", () => {
    const rows = () => cy.get(".mx-name-dataGrid21 [role=row]");
    const column = n => rows().find(`[role=cell]:nth-child(${n})`);
    const option = label => cy.contains("[role=menuitem]", label);
    const enumSelect = () => cy.get(".mx-name-drop_downFilter1 input");
    const roleSelect = () => cy.get(".mx-name-drop_downFilter3 input");
    const companySelect = () => cy.get(".mx-name-drop_downFilter4 input");

    beforeEach(() => {
        cy.visit("/p/filtering-multi"); // resets page
    });

    it("filter rows where enum attribute equal to one of selected values", () => {
        rows().should("have.length", 10 + 1);
        column(2).first().should("have.text", "Black");
        column(2).last().should("have.text", "Blue");
        enumSelect().click();
        option("Pink").click();
        rows().should("have.length", 5 + 1);
        option("Blush").click();
        rows().should("have.length", 7 + 1);
        enumSelect().click();
        column(2).should("have.text", "PinkPinkPinkBlushBlushPinkPink");
    });

    it("filter rows where ReferenceSet contains at least one of selected objects", () => {
        const expectedColumnText = [
            "EconomistArmed forces officerTraderHealth service manager",
            "EconomistArmed forces officerTrader",
            "EconomistEditorial assistantArmed forces officer",
            "Public librarianImmunologistWaste disposal officer",
            "Public librarianMaterials specialistWaste disposal officer",
            "EconomistNanoscientist",
            "Economist",
            "Homeless workerEditorial assistantPublic librarian",
            "Environmental scientistPublic librarianMaterials specialist"
        ];

        column(3).first().should("have.text", expectedColumnText[0]);
        roleSelect().click();
        option("Economist").click();
        rows().should("have.length", 5 + 1);
        option("Public librarian").click();
        rows().should("have.length", 9 + 1);
        roleSelect().click();
        column(3).each((cell, index) => {
            expect(cell).to.have.text(expectedColumnText[index]);
        });
    });

    it("filter rows where Reference equal to one of selected objects", () => {
        rows().should("have.length", 10 + 1);
        column(4).first().should("have.text", "W.R. Berkley Corporation");
        column(4).last().should("have.text", "PETsMART Inc");
        companySelect().click();
        option("FMC Corp").click();
        rows().should("have.length", 1 + 1);
        option("ALLETE, Inc.").click();
        rows().should("have.length", 5 + 1);
        companySelect().click();
        column(4).should("have.text", "ALLETE, Inc.FMC CorpALLETE, Inc.ALLETE, Inc.ALLETE, Inc.");
    });
});
