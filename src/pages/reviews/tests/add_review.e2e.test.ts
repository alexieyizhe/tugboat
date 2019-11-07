describe("Add review modal", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("can be opened and closed", () => {
    cy.get("#add-review-modal")
      .invoke("attr", "aria-hidden")
      .should("be", "true");
    cy.get("header")
      .find("[aria-label='Add review button']")
      .click();

    cy.get("#add-review-modal")
      .invoke("attr", "aria-hidden")
      .should("be", "false");

    cy.get("header")
      .find("[aria-label='Add review button']")
      .click();

    cy.get("#add-review-modal")
      .invoke("attr", "aria-hidden")
      .should("be", "true");
  });
});
