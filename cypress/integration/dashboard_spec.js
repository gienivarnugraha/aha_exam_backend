const { tokenGenerate } = require("../../helpers/jwt.js");

describe("testing dashboard", () => {
  before(() => {
    cy.task("createUser");
  });

  after(() => {
    cy.task("deleteUser").then(() => {
      cy.clearCookie("access_token");
    });
  });

  beforeEach(() => {
    cy.request("POST", "/user/login", {
      email: Cypress.env("gmailAccount"),
      password: "Password123!",
    });

    cy.visit("/reset_password");
    cy.intercept("POST", "/user/reset_password").as("reset");
  });

  it("confirmation password is wrong", () => {
    cy.getCookie("access_token").should("exist");

    cy.get('input[name="oldPassword"]').type("Password123!");
    cy.get('input[name="newPassword"]').type("Adminnew123!");
    cy.get('input[name="confirmPassword"]').type("FalsePassword123!");
    cy.get('button[name="submit"]').click();

    cy.wait("@reset").its("response.statusCode").should("eq", 200);

    cy.get("[data-cy='validator-error']").should(
      "contain",
      "your confirmation password do not match!"
    );
  });

  it("old password is wrong", () => {
    cy.get('input[name="oldPassword"]').type("Admin123!");
    cy.get('input[name="newPassword"]').type("Adminnew123!");
    cy.get('input[name="confirmPassword"]').type("Adminnew123!");
    cy.get('button[name="submit"]').click();

    cy.wait("@reset").its("response.statusCode").should("eq", 200);

    cy.get("[data-cy='validator-error']").should(
      "contain",
      "your old password is wrong!"
    );
  });

  it("old password and new password is same", () => {
    cy.get('input[name="oldPassword"]').type("Password123!");
    cy.get('input[name="newPassword"]').type("Password123!");
    cy.get('input[name="confirmPassword"]').type("Password123!");
    cy.get('button[name="submit"]').click();

    cy.wait("@reset").its("response.statusCode").should("eq", 200);

    cy.get("[data-cy='validator-error']").should(
      "contain",
      "your old password and new password cannot be the same!"
    );
  });

  it("reset password", () => {
    cy.get('input[name="oldPassword"]').type("Password123!");
    cy.get('input[name="newPassword"]').type("Admin123!");
    cy.get('input[name="confirmPassword"]').type("Admin123!");
    cy.get('button[name="submit"]').click();

    cy.wait("@reset").its("response.statusCode").should("eq", 200);

    cy.get("[data-cy='validator-error']").should(
      "contain",
      "Password changed!"
    );
  });
});
