const { tokenGenerate } = require("../../helpers/jwt.js");

describe("testing dashboard", () => {
  before(() => {
    cy.task("createUser");
  });

  after(() => {
    cy.task("deleteUser").then(() => {
      cy.clearCookie("accesstoken");
    });
  });

  beforeEach(() => {
    cy.request("POST", "/user/login", {
      email: Cypress.env("gmailAccount"),
      password: "admin",
    });

    cy.visit("/reset_password");
    cy.intercept("POST", "/user/reset_password").as("reset");
  });

  it("confirmation password is wrong", () => {
    cy.get('input[name="oldPassword"]').type("admin");
    cy.get('input[name="newPassword"]').type("haha");
    cy.get('input[name="confirmPassword"]').type("hehe");
    cy.get('button[name="submit"]').click();

    cy.wait("@reset").its("response.statusCode").should("eq", 200);

    cy.get("[data-cy='message']").should(
      "contain",
      "your confirmation password do not match!"
    );
  });

  it("old password is wrong", () => {
    cy.get('input[name="oldPassword"]').type("hehe");
    cy.get('input[name="newPassword"]').type("haha");
    cy.get('input[name="confirmPassword"]').type("haha");
    cy.get('button[name="submit"]').click();

    cy.wait("@reset").its("response.statusCode").should("eq", 200);

    cy.get("[data-cy='message']").should(
      "contain",
      "your old password is wrong!"
    );
  });

  it("old password and new password is same", () => {
    cy.get('input[name="oldPassword"]').type("admin");
    cy.get('input[name="newPassword"]').type("admin");
    cy.get('input[name="confirmPassword"]').type("admin");
    cy.get('button[name="submit"]').click();

    cy.wait("@reset").its("response.statusCode").should("eq", 200);

    cy.get("[data-cy='message']").should(
      "contain",
      "your old password and new password cannot be the same!"
    );
  });

  it("reset password", () => {
    cy.get('input[name="oldPassword"]').type("admin");
    cy.get('input[name="newPassword"]').type("hehe");
    cy.get('input[name="confirmPassword"]').type("hehe");
    cy.get('button[name="submit"]').click();

    cy.wait("@reset").its("response.statusCode").should("eq", 200);

    cy.get("[data-cy='message']").should("contain", "Password changed!");
  });
});
